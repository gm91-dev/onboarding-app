// controller for the connection with cloudant nosql database
var fs = require('fs');

var Q = require ('q');

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'my_projects'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
}

module.exports.initDBConnection = function() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Once you have the credentials, paste them into a file called vcap-local.json.
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("vcap-local.json", "utf-8"));
    }

    cloudant = require('cloudant')(dbCredentials.url);

    // check if DB exists if not create
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
        if (err) {
            console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
        }
    });

    db = cloudant.use(dbCredentials.dbName);
};

// This function is called on app.js main file
// initDBConnection();

// This function is to insert a project into the nosql database, save a document and insert
module.exports.saveProjectDocument = function(project_name, project_description, budget, team_members) {
	// Here the code to retrieve the parameters and insert a new project document in the database
	// remember that the project name must be unique
	var deferred = Q.defer();
	console.log("project_name : " + project_name);
	console.log("team_members : " + team_members);
	db.insert({
		project_name : project_name,
		project_description : project_description,
		budget : budget,
		team_members : team_members
	}, project_name, function(err, doc) {
		if (err) {
			console.log(err);
			console.log("err.error : " + err.error);
			deferred.reject();
		}
		else {
			console.log(doc);
			deferred.resolve(doc);
		}
	});
	return deferred.promise;
};

module.exports.cloudantnosql_searchforproject = function(project_name_to_search) {
	var deferred = Q.defer();
	var id_project = project_name_to_search;
	db.get(id_project, {
        revs_info: true
    }, function(err, doc) {
        if (!err) {
          console.log("DOCUMENT RETRIEVED AND SEARCHED : " + doc);
					deferred.resolve(doc);
        }
				else {
          console.log("ERR IN RETRIEVING DOC - ERR : " + err);
					deferred.reject();
				}
    });
		return deferred.promise;
};
