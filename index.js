const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var mysql = require('mysql');

const app = express();

//create connection to mysql db
try {
  var con = mysql.createConnection({
    host: "qzkp8ry756433yd4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "uoz4qxsooap10l9c",
    password: "ivq70bw6vnhss8e1",
    database: "ojb6fb1yyvuaj3a8"
  });
} catch (err) {
  console.log(err);
  res.send("Error " + err);
}

//connect to mysql db
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");

  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => {

    con.query("SELECT * FROM rooms", (err, result) => {
      if (err) throw err;
      var rooms = result;

      con.query("SELECT * FROM teams", (err, result) => {
        if (err) throw err;
        var teams = result;

        res.render('pages/index', { rooms: rooms, teams: teams });

      });
    });
  });

  app.get('/admin', (req, res) => {
    con.query("SELECT * FROM rooms", (err, result) => {
      if (err) throw err;
      var rooms = result;

      con.query("SELECT * FROM teams", (err, result) => {
        if (err) throw err;
        var teams = result;

        res.render('pages/admin', { rooms: rooms, teams: teams });
      });
    });
  });

  app.get('/signup', (req, res) => {
    res.render('pages/signup', {});
  });

  app.get('/team-submit', (req, res) => {
    //check if the name is already taken
    con.query("SELECT * FROM teams", (err, result) => {
      if (err) throw err;
      var teams = result;

      console.log(teams);
      console.log(req.query.teamName);

      let exists = false;
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].name === req.query.teamName) {
          console.log('already taken');
          res.render('pages/signupError');
          break;
          exists = true;
        }
      };

      if (!exists) {
        console.log('not taken');

        //add to sql db
        con.query("INSERT INTO teams (name) VALUES ('" + req.query.teamName + "')", (err, result) => {
          if (err) throw err;
          //render signup landing page
          res.render('pages/teamSubmit', { teamName: req.query.teamName });
        });
      }
    });
  });

  app.get('/teamEdit', (req, res) => {
    con.query("SELECT * FROM teams WHERE id=" + req.query.id, (err, result) => {
      if (err) throw err;
      var team = result[0];

      res.render('pages/teamEdit', { team: team });
    });

  });

  app.get('/roomEdit', (req, res) => {
    con.query("SELECT * FROM rooms WHERE id=" + req.query.id, (err, result) => {
      if (err) throw err;
      var room = result[0];

      res.render('pages/roomEdit', { room: room });
    });

  });


  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
  //sql connection closed
