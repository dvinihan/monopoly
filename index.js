const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//create connection to mysql db
try {
  var con = mysql.createConnection({
    host: 'qzkp8ry756433yd4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'uoz4qxsooap10l9c',
    password: 'ivq70bw6vnhss8e1',
    database: 'ojb6fb1yyvuaj3a8'
  });
} catch (err) {
  console.log(err);
  throw (err);
}
///////////////////////////////

//connect to mysql db
con.connect(err => {
  if (err) throw err;
  console.log('Connected!');

  // Middleware to fetch data from MySQL database on each HTTP call
  app.use((req, res, next) => {
    con.query('SELECT * FROM rooms', (err, result) => {
      if (err) throw err;
      let rooms = result;

      con.query('SELECT * FROM teams', (err, result) => {
        if (err) throw err;
        let teams = result;

        con.query('SELECT * FROM users', (err, result) => {
          if (err) throw err;
          let users = result;

          req.rooms = rooms;
          req.teams = teams;
          req.users = users
          next();
        });
      });
    });
  });

  //Apostrophe check
  app.use((req, res, next) => {
    for (const key in req.body) {
      let value = req.body[key];
      if (value.trim() === "") {
        res.render('pages/error', { rooms: req.rooms, teams: req.teams });
      } else {
        let newString = '';

        for (let i = 0; i < value.length; i++) {
          if (value[i] === "'") {
            newString += "''";
          } else newString += value[i];
        }
        req.body[key] = newString;
      }
    };
    next();
  });


  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  let adminVerified = false;

  ///////////////////////////////

  app.get('/', (req, res) => {
    res.render('pages/index', { teams: req.teams });
  });

  app.get('/login', (req, res) => {
    adminVerified ? res.redirect('/') : res.render('pages/login', { error: false });
  });

  app.post('/login', (req, res) => {
    //adminVerified is declared and defined as false above, outside of any get call.
    if (req.body.username && req.body.password) {
      req.users.forEach(user => {
        if (user.username === req.body.username && user.password === req.body.password) {
          adminVerified = true;
        }
      });

      //set a timeout for 10 minutes, after which the user will no longer be logged in.
      setTimeout(() => {
        adminVerified = false;
      }, 600000);

      adminVerified ? res.redirect('/admin') : res.render('pages/login', { error: true });
    } else {
      res.render('pages/login', { error: false });
    }
  });

  app.get('/admin', (req, res) => {
    res.render('pages/admin', { rooms: req.rooms, teams: req.teams })
  })

  app.get('/signup', (req, res) => {
    res.render('pages/signup', { error: false });
  });

  app.post('/signup', (req, res) => {
    //check if the name is already taken
    let exists = false;
    for (let i = 0; i < req.teams.length; i++) {
      if (req.teams[i].name === req.body.teamName) {
        exists = true;
      }
    }

    if (exists) {
      res.render('pages/signup', { error: true });
    } else {
      con.query(`INSERT INTO teams (name) VALUES ('${req.body.teamName}')`, (err) => {
        if (err) throw err;
        res.redirect('/');
      });

    }
  });

  app.get('/teamEdit', (req, res) => {
    let team = req.teams.find(team => team.id == req.query.id);
    res.render('pages/teamEdit', { team: team });
  });

  app.post('/teamEdit', (req, res) => {
    con.query(`UPDATE teams SET name = '${req.body.name}', score = '${req.body.score}' WHERE id=${req.body.id}`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  app.get('/roomEdit', (req, res) => {
    let room = req.rooms.find(room => room.id == req.query.id);
    res.render('pages/roomEdit', { room: room, teams: req.teams });
  });

  app.post('/roomEdit', (req, res) => {
    if (!req.body.name) {
      res.render('pages/error', { rooms: req.rooms, teams: req.teams });
    } else {
      let teamId = req.teams.find(team => team.name === req.body.teamName).id;

      con.query(`UPDATE rooms SET name = '${req.body.name}', time = '${req.body.time}', teamId = '${teamId}' WHERE id = '${req.body.id}'`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    }
  });

  app.get('/roomAdd', (req, res) => {
    res.render('pages/roomAdd', { teams: req.teams });
  });

  app.post('/roomAdd', (req, res) => {
    if (!req.body.name) {
      res.render('pages/error', { rooms: req.rooms, teams: req.teams });
    } else {
      let exists = false;
      for (let i = 0; i < req.rooms.length; i++) {
        if (req.rooms[i].name === req.body.name) {
          exists = true;
        }
      }

      if (exists) {
        res.render('pages/error', { rooms: req.rooms, teams: req.teams });
      } else {
        con.query(`INSERT INTO rooms (name, time, teamId) VALUES('${req.body.name}', '${req.body.time}', '${req.body.teamId}')`, (err) => {
          if (err) throw err;
          res.redirect('/admin');
        });
      }
    }
  });

  app.get('/roomDelete', (req, res) => {
    res.render('pages/roomDelete', { rooms: req.rooms, teams: req.teams });
  });

  app.post('/roomDelete', (req, res) => {
    con.query(`DELETE FROM rooms WHERE id = '${req.body.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  app.get('/teamDelete', (req, res) => {
    res.render('pages/teamDelete', { rooms: req.rooms, teams: req.teams });
  });

  app.post('/teamDelete', (req, res) => {
    con.query(`UPDATE rooms SET teamId ='0' WHERE teamId = ${req.body.id}`);

    con.query(`DELETE FROM teams WHERE id = '${req.body.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  ///////////////////////////////

  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
//sql connection closed
