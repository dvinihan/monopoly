const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var mysql = require('mysql');

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

        callback(rooms, teams);

      });
    });
  }
  ///////////////////////////////


  //Home Page
  app.get('/', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/index', { rooms: rooms, teams: teams });
    });
  });
  ///////////////////////////////



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

  app.get('/team-submit', (req, res) => {
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
        con.query(`INSERT INTO teams (name) VALUES ('${req.query.teamName}')`, (err) => {
          if (err) throw err;
          //render signup landing page
          res.render('pages/teamSubmit', { teamName: req.query.teamName });
        });
      }
    });
  });
  ///////////////////////////////


  //Team Edit Page
  app.get('/teamEdit', (req, res) => {
    con.query('SELECT * FROM teams WHERE id=' + req.query.id, (err, result) => {
      if (err) throw err;
      var team = result[0];

      res.render('pages/teamEdit', { team: team });
    });
  });

  //Team Edit Action
  app.get('/teamUpdate', (req, res) => {
    con.query(`UPDATE teams SET name = '${req.query.teamName}' WHERE id=${req.query.id}`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
  ///////////////////////////////

  //Room Edit Page
  app.get('/roomEdit', (req, res) => {
    getData(function (rooms, teams) {
      con.query('SELECT * FROM rooms WHERE id=' + req.query.id, (err, result) => {
        if (err) throw err;
        var thisRoom = result[0];

        res.render('pages/roomEdit', { room: thisRoom, teams: teams });
      });
    });
  });

  //Room Edit Action
  app.get('/roomUpdate', (req, res) => {
    getData(function (rooms, teams) {
      let teamId = null;
      if (req.query.teamName !== "") {
        teamId = teams.find(team => team.name === req.query.teamName).id;
      }

      con.query(`UPDATE rooms SET name = '${req.query.name}', time = '${req.query.time}', teamId = '${teamId}' WHERE id = '${req.query.id}'`, (err) => {
        if (err) throw err;

      });
    });
    res.redirect('/admin');
  });
  ///////////////////////////////


  //Room Add Page
  app.get('/addRoom', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/addRoom', { teams: teams });
    });
  });

  //Room Add Action
  app.get('/roomInsert', (req, res) => {
    getData(function (rooms, teams) {
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
        con.query(`INSERT INTO rooms (name, time, teamId) VALUES('${req.query.name}', '${req.query.time}', '${req.query.teamId}')`, (err) => {
          if (err) throw err;
          //render signup landing page
          res.redirect('/admin');
        });
      }
    });
  });
  ///////////////////////////////

  //Room Delete Page
  app.get('/deleteRoomPage', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/deleteRoom', { rooms: rooms, teams: teams });
    });
  });

  //Room Delete Action 
  app.get('/deleteRoomAction', (req, res) => {
    con.query(`DELETE FROM rooms WHERE id = '${req.query.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
  ///////////////////////////////


  //Team Delete Page
  app.get('/deleteTeamPage', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/deleteTeam', { rooms: rooms, teams: teams });
    });
  });

  //Team Delete Action
  app.get('/deleteTeamAction', (req, res) => {
    con.query(`DELETE FROM teams WHERE id = '${req.query.id}'`, (err) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
  ///////////////////////////////


  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
//sql connection closed
