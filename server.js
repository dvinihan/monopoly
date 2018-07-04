const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));


/////////////    CREATE MYSQL CONNECTION     /////////////////
try {
  var con = mysql.createConnection({
    host: 'qzkp8ry756433yd4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'uoz4qxsooap10l9c',
    password: 'ivq70bw6vnhss8e1',
    database: 'ojb6fb1yyvuaj3a8'
  });
} catch (err) {
  throw (err);
}

//////////  HELPER FUNCTIONS    ////////////////////
function sortArray(array, sortBy) {
  let newArray = [];
  let none = false;
  let noneItem;

  array.forEach(item => {
    if (item.name === "--None--") {
      none = true;
      noneItem = item;
    } else {
      for (let i = 0; i < newArray.length; i++) {
        if (sortBy === 'name' && item.name.toLowerCase() < newArray[i].name.toLowerCase()) {
          newArray.splice(i, 0, item);
          return;
        } else if (item.score > newArray[i].score) {
          newArray.splice(i, 0, item);
          return;
        }
      }
      newArray.push(item);
    }
  });

  if (none) { newArray.unshift(noneItem); }
  return newArray;
}

/////////   ENTER DATABASE CONNECTION  /////////
con.connect(err => {
  if (err) throw err;
  console.log('Connected!');

  // Middleware to fetch data from MySQL database on each HTTP call
  app.use((req, res, next) => {
    con.query('SELECT * FROM rooms', (err, result) => {
      if (err) throw err;
      let rooms = result;

      //sort rooms alphabetically
      rooms = sortArray(rooms, "name");

      con.query('SELECT * FROM teams', (err, result) => {
        if (err) throw err;
        let teams = result;

        //sort teams alphabetically
        teams = sortArray(teams, "name");

        con.query('SELECT * FROM users', (err, result) => {
          if (err) throw err;
          let users = result;

          req.rooms = rooms;
          req.teams = teams;
          req.users = users;
          next();
        });
      });
    });
  });


  //Apostrophe check Middleware
  app.use((req, res, next) => {
    if (req.body && req.body.name !== undefined) {
      if (req.body.name.trim() === "") {
        res.render('pages/error', { error: "Name cannot be blank." });
        return;
      }

      // Check for double quotes
      if (req.body.name.includes("\"")) {
        res.render('pages/error', { error: "Names cannot contain a double quote." });
        return;
      }
      else {
        let value = req.body.name;
        let newString = '';

        for (let i = 0; i < value.length; i++) {
          if (value[i] === "'") {
            newString += "''";
          } else newString += value[i];
        }
        req.body.name = newString;
      }
    }
    next();
  });


  app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

  /////////////   ROUTES    //////////////////////

  app.get('/', (req, res) => {
    // Sort teams by score
    let teams = sortArray(req.teams, 'score');
    res.render('pages/index', { teams: teams });
  })
    .get('/login', (req, res) => {
      res.render('pages/login', { error: false });
    })
    .post('/login', (req, res) => {
      let user = req.users.find(user => {
        return user.username === req.body.username;
      });
      if (user && user.password === req.body.password) {
        res.redirect('/admin');
      }
      else {
        res.render('pages/login', { error: true });
      }
    })
    .get('/admin', (req, res) => {
      res.render('pages/admin', { rooms: req.rooms, teams: req.teams })
    })
    .get('/signup', (req, res) => {
      res.render('pages/signup', { error: false });
    })
    .post('/signup', (req, res) => {
      //check if the name is already taken
      let exists = false;
      for (let i = 0; i < req.teams.length; i++) {
        if (req.teams[i].name === req.body.name) {
          exists = true;
        }
      }

      if (exists) {
        res.render('pages/signup', { error: true });
      } else {
        con.query(`INSERT INTO teams (name) VALUES ('${req.body.name}')`, (err) => {
          if (err) throw err;
          res.redirect('/');
        });
      }
    })
    .get('/teamEdit', (req, res) => {
      let team = req.teams.find(team => team.id == req.query.id);
      res.render('pages/teamEdit', { team: team });
    })
    .post('/teamEdit', (req, res) => {
      con.query(`UPDATE teams SET name = '${req.body.name}', score = '${req.body.score}' WHERE id=${req.body.id}`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    })
    .get('/roomEdit', (req, res) => {
      let room = req.rooms.find(room => room.id == req.query.id);
      res.render('pages/roomEdit', { room: room, teams: req.teams });
    })
    .post('/roomEdit', (req, res) => {
      con.query(`UPDATE rooms SET name = '${req.body.name}', time = '${req.body.time}', teamId = '${req.body.teamId}' WHERE id = '${req.body.id}'`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    })
    .get('/roomAdd', (req, res) => {
      res.render('pages/roomAdd', { teams: req.teams });
    })
    .post('/roomAdd', (req, res) => {
      con.query(`INSERT INTO rooms (name, time, teamId) VALUES('${req.body.name}', '${req.body.time}', '${req.body.teamId}')`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    })
    .get('/roomDelete', (req, res) => {
      res.render('pages/roomDelete', { rooms: req.rooms, teams: req.teams });
    })
    .post('/roomDelete', (req, res) => {
      con.query(`DELETE FROM rooms WHERE id = '${req.body.id}'`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    })
    .get('/teamDelete', (req, res) => {
      res.render('pages/teamDelete', { rooms: req.rooms, teams: req.teams });
    })
    .post('/teamDelete', (req, res) => {
      con.query(`UPDATE rooms SET teamId ='0' WHERE teamId = ${req.body.id}`);

      con.query(`DELETE FROM teams WHERE id = '${req.body.id}'`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    });

  /////////////////////////////////////////////////////////////

  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
//sql connection closed