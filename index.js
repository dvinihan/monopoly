const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var mysql = require('mysql');

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

con.connect(err => {
  if (err) throw err;
  console.log("Connected!");

  express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => {

      con.query("SELECT * FROM rooms", (err, result) => {
        if (err) throw err;
        var rooms = result;

        con.query("SELECT * FROM teams", (err, result) => {
          if (err) throw err;
          var teams = result;

          res.render('pages/index', { rooms: rooms, teams: teams });

        });
      });
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

})



