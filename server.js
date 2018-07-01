const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const mongodb = require('mongodb');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//set up MongoDB connection
let uri = 'mongodb://heroku_bwvq81lz:jkkpltt61ik7t9afilv2urcle9@ds123981.mlab.com:23981/heroku_bwvq81lz';

mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
  if (err) throw err;
  const db = client.db('heroku_bwvq81lz');


  let rooms = db.collection('rooms');
  let teams = db.collection('teams');
  let users = db.collection('users');

  users.find({}).toArray(function (err, docs) {
    console.log(docs);
  });


  client.close(function (err) {
    if (err) throw err;
  });
});

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

function sortArray(array) {
  let newArray = [];
  array.forEach(item => {
    for (let i = 0; i < newArray.length; i++) {
      if (item.name.toLowerCase() < newArray[i].name.toLowerCase()) {
        newArray.splice(i, 0, item);
        return;
      }
    }
    newArray.push(item);
  });
  return newArray;
}

//connect to mysql db
con.connect(err => {
  if (err) throw err;
  console.log('Connected!');

  // Middleware to fetch data from MySQL database on each HTTP call
  app.use((req, res, next) => {
    con.query('SELECT * FROM rooms', (err, result) => {
      if (err) throw err;
      let rooms = result;

      //sort rooms alphabetically
      rooms = sortArray(rooms);

      con.query('SELECT * FROM teams', (err, result) => {
        if (err) throw err;
        let teams = result;

        //sort teams alphabetically
        teams = sortArray(teams);

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

  //set up session management
  app.use(session({
    cookieName: 'session',
    secret: 'wl36969;0)kejfl-sdfsdf1?s55df-{{}D++sdf;l',
    duation: 20 * 60 * 1000,
    activeDuration: 10 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
  }));

  app.use((req, res, next) => {
    if (req.session && req.session.user) {
      let user = req.users.find(user => user.username === req.session.user.username);
      if (user) {
        req.user = user;
        delete req.user.password;
        req.session.user = user;
        res.locals.user = user;
      }
    }
    next();
  });

  function requireLogin(req, res, next) {
    if (!req.user) {
      res.redirect('/login');
    } else {
      next();
    }
  }


  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  ///////////////////////////////
  app.get('/', (req, res) => {
    res.render('pages/index', { teams: req.teams });
  });

  app.get('/login', (req, res) => {
    res.render('pages/login', { error: false });
  });

  app.post('/login', (req, res) => {
    let user;
    for (let i = 0; i < req.users.length; i++) {
      if (req.users[i].username === req.body.username && req.users[i].password === req.body.password) {
        user = req.users[i];
        break;
      }
    }

    if (!user) {
      res.render('pages/login', { error: true });
    } else {
      req.session.user = user;
      res.redirect('/admin');
    }
  });

  app.get('/admin', requireLogin, (req, res) => {
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

  app.get('/teamEdit', requireLogin, (req, res) => {
    let team = req.teams.find(team => team.id == req.query.id);
    res.render('pages/teamEdit', { team: team });
  });

  app.post('/teamEdit', (req, res) => {
    con.query(`UPDATE teams SET name = '${req.body.name}', score = '${req.body.score}' WHERE id=${req.body.id}`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  app.get('/roomEdit', requireLogin, (req, res) => {
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

  app.get('/roomAdd', requireLogin, (req, res) => {
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

  app.get('/roomDelete', requireLogin, (req, res) => {
    res.render('pages/roomDelete', { rooms: req.rooms, teams: req.teams });
  });

  app.post('/roomDelete', (req, res) => {
    con.query(`DELETE FROM rooms WHERE id = '${req.body.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  app.get('/teamDelete', requireLogin, (req, res) => {
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
