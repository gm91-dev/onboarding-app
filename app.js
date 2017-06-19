/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server

var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// request module provides a simple way to create HTTP requests in Node.js
var request = require('request');

// path module
var path = require('path');

// routes file
var routes = require('./routes')(app);

// getting the main page (index.html)
app.get('/', function (req, res) {
 res.sendFile(path.join(__dirname + '/public/index.html'));
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var PostgreSQL_DB_controller = require('./controller/compose-postgresql-connection');
PostgreSQL_DB_controller.postgresql_database_connection();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
