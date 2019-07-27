// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(bodyParser.json());
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/timestamp/:date_string', (req, res) => {
  var dateVal = req.params.date_string;
  if (isNaN(dateVal)) {
    var date = new Date(dateVal).toUTCString();
    var unixDate = new Date(dateVal).getTime();

    // Check if we got a valid date
    date === "Invalid Date" ? res.json({ error: date }) : res.json({ unix: unixDate, utc: date });
  }
  else {
    var date = new Date(Number(dateVal)).toUTCString();
    res.json({ unix: dateVal, utc: date });
  }
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});