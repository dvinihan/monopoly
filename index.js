const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const mysql = require('mysql');

const app = express();

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

//Apostrophe check
function fixQuote(string) {
  let newString = '';

  for (let i = 0; i < string.length; i++) {
    if (string[i] === "'") {
      newString += "''";
    } else newString += string[i];
  }

  return newString;
}

//connect to mysql db
con.connect(err => {
  if (err) throw err;
  console.log('Connected!');

  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  function getData(callback) {
    con.query('SELECT * FROM rooms', (err, result) => {
      if (err) throw err;
      let rooms = result;

      con.query('SELECT * FROM teams', (err, result) => {
        if (err) throw err;
        let teams = result;

        con.query('SELECT * FROM users', (err, result) => {
          if (err) throw err;
          let users = result;

          callback(rooms, teams, users);

        });
      });
    });
  }
  ///////////////////////////////
  app.get('/verify', (req, res) => {
    console.log('in verify');
    getData(function (rooms, teams, users) {
      console.log('users:');
      console.log(users);

      let verified = false;
      users.forEach(user => {
        if (user.username === req.query.username) {
          if (user.password === req.query.password) {
            verified = true;
          }
        }
      });


      verified ? res.redirect('/admin') : res.redirect('/login');
    });
  });


  //Home Page
  app.get('/', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/index', { rooms: rooms, teams: teams });
    });
  });
  ///////////////////////////////


  //Login Page
  app.get('/login', (req, res) => {
    res.render('pages/login', {});
  });

  //Admin Page
  app.get('/admin', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/admin', { rooms: rooms, teams: teams });
    });
  });
  ///////////////////////////////



  //Team Signup Page
  app.get('/signup', (req, res) => {
    res.render('pages/signup', {});
  });

  app.get('/teamSubmit', (req, res) => {
    //check if the name is already taken
    con.query('SELECT * FROM teams', (err, result) => {
      if (err) throw err;
      var teams = result;

      let exists = false;
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].name === req.query.teamName) {
          exists = true;
        }
      }

      if (exists) {
        res.render('pages/signupError');
      } else {
        //add to sql db
        let teamName = fixQuote(req.query.teamName);
        con.query(`INSERT INTO teams (name) VALUES ('${teamName}')`, (err) => {
          if (err) throw err;
          //render signup landing page
          res.render('pages/teamSubmit', { teamName: teamName });
        });
      }
    });
  });
  ///////////////////////////////


  //Team Edit Page
  app.get('/teamEditPage', (req, res) => {
    con.query('SELECT * FROM teams WHERE id=' + req.query.id, (err, result) => {
      if (err) throw err;
      var team = result[0];

      res.render('pages/teamEdit', { team: team });
    });
  });

  //Team Edit Action
  app.get('/teamEditAction', (req, res) => {
    if (req.query.teamName === "") {
      res.render('pages/error');
    } else {
      let teamName = fixQuote(req.query.teamName);
      con.query(`UPDATE teams SET name = '${teamName}' WHERE id=${req.query.id}`, (err) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    }
  });
  ///////////////////////////////

  //Room Edit Page
  app.get('/roomEditPage', (req, res) => {
    getData(function (rooms, teams) {
      con.query('SELECT * FROM rooms WHERE id=' + req.query.id, (err, result) => {
        if (err) throw err;
        var thisRoom = result[0];

        res.render('pages/roomEdit', { room: thisRoom, teams: teams });
      });
    });
  });

  //Room Edit Action
  app.get('/roomEditAction', (req, res) => {
    getData(function (rooms, teams) {
      if (req.query.teamName === "") {
        getData(function (rooms, teams) {
          res.render('pages/error', { rooms: rooms, teams: teams });
        });
      } else {
        let teamId = 0;
        if (req.query.teamName !== "") {
          teamId = teams.find(team => team.name === req.query.teamName).id;
        }

        let name = fixQuote(req.query.name);
        con.query(`UPDATE rooms SET name = '${name}', time = '${req.query.time}', teamId = '${teamId}' WHERE id = '${req.query.id}'`, (err) => {
          if (err) throw err;
          res.redirect('/admin');
        });
      }
    });
  });
  ///////////////////////////////


  //Room Add Page
  app.get('/roomAddPage', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/addRoom', { teams: teams });
    });
  });

  //Room Add Action
  app.get('/roomAddAction', (req, res) => {
    getData(function (rooms, teams) {
      if (req.query.teamName === "") {
        res.render('pages/error');
      } else {
        let exists = false;
        for (let i = 0; i < rooms.length; i++) {
          if (rooms[i].name === req.query.name) {
            exists = true;
          }
        }

        if (exists) {
          res.render('pages/roomAddError');
        } else {
          //add to sql db
          let name = fixQuote(req.query.name);
          con.query(`INSERT INTO rooms (name, time, teamId) VALUES('${name}', '${req.query.time}', '${req.query.teamId}')`, (err) => {
            if (err) throw err;
            //render signup landing page
            res.redirect('/admin');
          });
        }
      }
    });
  });
  ///////////////////////////////

  //Room Delete Page
  app.get('/roomDeletePage', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/deleteRoom', { rooms: rooms, teams: teams });
    });
  });

  //Room Delete Action 
  app.get('/roomDeleteAction', (req, res) => {
    con.query(`DELETE FROM rooms WHERE id = '${req.query.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
  ///////////////////////////////


  //Team Delete Page
  app.get('/teamDeletePage', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/deleteTeam', { rooms: rooms, teams: teams });
    });
  });

  //Team Delete Action
  app.get('/teamDeleteAction', (req, res) => {
    con.query(`DELETE FROM teams WHERE id = '${req.query.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
  ///////////////////////////////


  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
//sql connection closed
