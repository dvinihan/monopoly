const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var mysql = require('mysql');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', (req, res) => {
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

      var sql = "SELECT * FROM rooms";
      con.query(sql, (err, result) => {
        if (err) throw err;
        res.render('pages/db', { results: result });
      });
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))



