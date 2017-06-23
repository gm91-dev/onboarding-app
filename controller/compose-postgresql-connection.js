var _this = this;

var express = require('express');

var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

var Q = require ('q');

var cfenv = require('cfenv');

// Util is handy to have around, so thats why that's here.
const util = require('util');
// and so is assert
const assert = require('assert');

// Then we'll pull in the database client library
var pg = require('pg');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Within the application environment (appenv) there's a services object
var services = appEnv.services;

// The services object is a map named by service so we extract the one for PostgreSQL
var pg_services = services["compose-for-postgresql"];

// This check ensures there is a services for PostgreSQL databases
// assert(!util.isUndefined(pg_services), "Must be bound to compose-for-postgresql services");

// We now take the first bound PostgreSQL service and extract it's credentials object
var credentials = pg_services[0].credentials;

// Within the credentials, an entry ca_certificate_base64 contains the SSL pinning key
// We convert that from a string into a Buffer entry in an array which we use when
// connecting.
var ca = new Buffer(credentials.ca_certificate_base64, 'base64');
var connectionString = credentials.uri;

// We want to parse connectionString to get username, password, database name, server, port
// So we can use those to connect to the database
var parse = require('pg-connection-string').parse;
config = parse(connectionString);

// Add some ssl
config.ssl = {
  rejectUnauthorized: false,
  ca: ca
}

// set up a new client using our config details
var client = new pg.Client(config);

// This function to set up the connection with PostgreSQL database
module.exports.postgresql_database_connection = function() {
  console.log("creating table");
  client.connect(function(err) {
    if (err) {
     console.log("error connecting");
     console.log(err);
    }
    else {
      client.query('CREATE TABLE IF NOT EXISTS users (email varchar(256) NOT NULL, name varchar(256) NOT NULL, surname varchar(256) NOT NULL, telephone varchar(256) NOT NULL, role varchar(256) NOT NULL, description varchar(256))', function (err,result){
        if (err) {
          console.log("error with query");
          console.log(err);
        }
        else {
          console.log("table created");
        }
      });
    }
  });
};

// This function is to edit info related to the admin user
module.exports.postgresql_edit_admin_info = function(email, name, surname, telephone, description) {
  var deferred = Q.defer();
  // set up a new client using our config details
  var client = new pg.Client(config);
  client.connect(function(err) {
    if (err) {
     console.log("errore 3");
     console.log(err);
     deferred.reject();
    }
    else {
      var queryText = 'UPDATE users SET telephone = $1, description = $2 WHERE users.email= $3';
      client.query(queryText, [telephone, description, email], function (error,result){
        if (error) {
         console.log("errore 4");
         console.log(error);
         deferred.reject();
        }
        else {
         console.log("Updating admin user info into the postegresql database: ");
         console.log(result);
         //check how result is printed and then manage it where called
         deferred.resolve(result);
        }
      });
    }
  });
  return deferred.promise;
};

// This function is to create and store a new user into the PostgreSQL database with all the needed information
module.exports.postgresql_save_user = function(email, name, surname, role, telephone, description) {
  console.log("reading parameters");
  console.log("reading email : " + email);
  var deferred = Q.defer();
  // set up a new client using our config details
  var client = new pg.Client(config);
  client.connect(function(err) {
    if (err) {
     console.log("errore 1");
     console.log(err);
     deferred.reject();
    }
    else {
      var queryText = 'INSERT INTO users(email,name,surname,telephone,role,description) VALUES($1, $2, $3, $4, $5, $6)';
      client.query(queryText, [email, name, surname, telephone, role, description], function (error,result){
        if (error) {
         console.log("errore 2");
         console.log(error);
         deferred.reject();
        }
        else {
         console.log("Saving the new user into the postegresql database: ");
         console.log(result);
         //check how result is printed and then manage it where called
         deferred.resolve(result);
        }
      });
    }
  });
  return deferred.promise;
};

// This function is to check if the user already exists
module.exports.postgresql_check_user = function(email){
  console.log("checking if a specific user already exists");
  var deferred = Q.defer();
  // set up a new client using our config details
  var client = new pg.Client(config);
  client.connect(function(err) {
    if (err) {
     console.log("error in checking a specific user");
     console.log(err);
     deferred.reject();
    }
    else {
      var queryText = 'SELECT 1 FROM users where email = $1 LIMIT 1';
      client.query(queryText, [email], function (error,result){
        if (error) {
         console.log("error in retrieving user");
         console.log(error);
         deferred.reject();
        }
        else {
         console.log("Extracting information from the database related to the specified user: ");
         //console.log(JSON.stringify(result));
         //check how result is printed and then manage it where called
         deferred.resolve(result);
        }
      });
    }
  });
  return deferred.promise;
};

// This function is to get user admin info - there's only one user with admin role into the database
module.exports.postgresql_read_admin_info = function(role) {
  console.log("retrieving admin info");
  var deferred = Q.defer();
  // set up a new client using our config details
  var client = new pg.Client(config);
  client.connect(function(err) {
    if (err) {
     console.log("errore admin 1");
     console.log(err);
     deferred.reject();
    }
    else {
      var queryText = 'SELECT * FROM users WHERE role= $1';
      client.query(queryText, [role], function (error,result){
        if (error) {
         console.log("errore admin 2");
         console.log(error);
         deferred.reject();
        }
        else {
         console.log("Reading the admin user info from the postegresql database: ");
         console.log(result);
         deferred.resolve(result);
        }
      });
    }
  });
  return deferred.promise;
};

// This function is to check if there is a row with admin user into the database
module.exports.check_existing_admin = function(role) {
  var deferred = Q.defer();
  // set up a new client using our config details
  var client = new pg.Client(config);
  client.connect(function(err) {
    if (err) {
     console.log(err);
     deferred.reject();
    }
    else {
      var queryText = 'SELECT 1 FROM users where role = $1 LIMIT 1';
      client.query(queryText, [role], function (error,result){
        if (error) {
         console.log(error);
         deferred.reject();
        }
        else {
         deferred.resolve(result);
        }
      });
    }
  });
  return deferred.promise;
};

module.exports.check_and_create_admin_user = function() {
  // Check if an admin exists
  var role = "admin";
  _this.check_existing_admin(role).then(function(result){
    if (result.rowCount == 0) {
      // create admin user
      var client = new pg.Client(config);
      client.connect(function(err) {
        if (err) {
         console.log(err);
        }
        else {
          var queryText = 'INSERT INTO users(email,name,surname,telephone,role,description) VALUES($1, $2, $3, $4, $5, $6)';
          client.query(queryText, ['', '', '', '', role, ''], function (error,result){
            if (error) {
             console.log(error);
            }
            else {
             console.log("Creating the new admin user into the postegresql database: ");
             console.log(result);
             //check how result is printed and then manage it where called
            }
          });
        }
      });
    }
    else
      return;
  });
};
