// routes file
var postgresql_db_controller = require('../controller/compose-postgresql-connection');
var cloudantnosql_db_controller = require('../controller/cloudant-nosql-db-connection');

var Q = require ('q');

// route for editing the user
/*
app.get('/user/edit', function(req, res){
  retrieveUserInfo().then(function(result){
  	res.render('admin-profile.ejs', {
  		title : 'Edit your profile',
  		admin-info: result
  	});
  });
});
*/

module.exports = function (app) {
  // route for routing to "adding a new user" page
  app.get('/user/add', function(req, res){
  	res.render('new-user-profile.ejs', {
  		title : 'Add a new user'
  	});
  });

  //route for routing to "editing the admin user info" page
  app.get('/user/admin', function(req, res){
    var role = "admin";
    // Retrieve the info of the admin user and render the page properly
    postgresql_db_controller.postgresql_read_admin_info(role).then(function(result){
      if(result == null){
        res.writeHead(404);
        res.end();
        return;
      }
      console.log("result of retrieving admin data : " + result);
      console.log('JSON.stringify(result) : ' + JSON.stringify(result));
      console.log('prova stampa : ' + result.rows[0].name);
      //res.writeHead(200);
      //res.end();
      res.render('admin-profile.ejs', {
    		title : 'Admin profile',
        email : result.rows[0].email,
        name : result.rows[0].name,
        surname : result.rows[0].surname,
        telephone : result.rows[0].telephone,
        description : result.rows[0].description
    	});
    });
  });

  // route for adding and storing a new user into the postgresql databases
  app.post('/user/save', function(req, res){
    console.log("routes");
    console.log("req.body.email : " + req.body.email);
    var email = req.body.email;
    var name = req.body.name;
    var surname = req.body.surname;
    var role = req.body.role;
    var telephone = req.body.telephone;
    var description = req.body.description;

    //checking if the user already exists
    postgresql_db_controller.postgresql_check_user(email).then(function(result){
      console.log("ROW COUNT : " + result.rowCount);
      console.log("Result existing user... : " + JSON.stringify(result));
      // checking if a user already exists - if rowcount is 0 the user can be stored into the database
      if (result.rowCount == 0) {
        // storing data into database
        postgresql_db_controller.postgresql_save_user(email, name, surname, role, telephone, description).then(function(result){
          console.log("RESULT: "+result);
          if(result == null){
    				res.writeHead(404);
    				res.end();
    				return;
    			}
          // TO DO
          // manage the result (?)
          console.log("result of storing data : " + result);
          res.writeHead(200);
    			res.end();
        });
      }
      else {
        var result_data = {duplicate_user : true};
        res.send(result_data);
        res.end();
      }
    });
  });


  // route for updating user admin info
  app.post('/user/edit/admin', function(req, res){
    console.log("reading user admin user info......");
    var email = req.body.email;
    var name = req.body.name;
    var surname = req.body.surname;
    var telephone = req.body.telephone;
    var description = req.body.description;

    postgresql_db_controller.postgresql_edit_admin_info(email, name, surname, telephone, description).then(function(result){
      console.log("RESULT admin info: "+result);
      if(result == null){
        res.writeHead(404);
        res.end();
        return;
      }
      console.log("result of updating admin data : " + result);
      res.writeHead(200);
      res.end();
    });
  });

  // route for routing to "adding a new project" page
  app.get('/project/add', function(req, res){
  	res.render('project-details.ejs', {
  		title : 'Create and manage your project'
  	});
  });

  // route for retrieving user information from email
  app.post('/user/retrieveInfo/', function(req, res){
    var user_email = req.body.user_email;
    console.log("EMAIL UTENTE : " + user_email);
    postgresql_db_controller.getUserInformation(user_email).then(function(result){
      console.log("RESULT USER INFO IN ROUTES: " + result.name);
      if(result == null) {
        console.log("eccoci");
        res.writeHead(404);
        res.end();
        return;
      }
      else {
        res.send(result);
        res.end();
      }
    });
  });

  // route for creating a new project
  app.post('/project/save', function(req, res){
    var project_name = req.body.project_name;
    var project_description = req.body.project_description;
    var project_budget = req.body.project_budget;
    var project_team_members = req.body.project_team_members;
    console.log("rotte-membri del team : " + req.body.project_team_members);
    //storing the project into the database
    cloudantnosql_db_controller.saveProjectDocument(project_name, project_description, project_budget, project_team_members).then(function(result){
      if(result == null){
        console.log("project err : " + result);
  			res.writeHead(404);
  			res.end();
  			return;
  		}
      console.log("result of storing project data : " + result);
      res.writeHead(200);
  		res.end();
    });
  });


  // route for searching an existing project
  app.get('/project/search/:projectID', function(req, res){
    var project_name_to_search = req.params.projectID;
    console.log("projectID : " + project_name_to_search);
    cloudantnosql_db_controller.cloudantnosql_searchforproject(project_name_to_search).then(function(result, err){
      console.log("risultato doc retrieved : " + result);
      if(result == null){
        console.log("risultato nullo retrieved : " + result);
        res.writeHead(404);
        res.end();
        return;
      }
      else {
        console.log("sono nell'else");
        var project_description = result.project_description;
        var project_budget = result.budget;
        var project_team_members = result.team_members;
        var project_team_members_string;
        console.log("result.project_name : " + result.project_name);
        console.log("result.budget : " + result.budget);
        console.log("result.project_description : " + result.project_description);
        console.log("result.team_members : " + result.team_members[0].email);

        var index;
        for (index = 0; index < project_team_members.length; ++index) {
          project_team_members_string = project_team_members_string.concat(project_team_members[index].email);
          project_team_members_string = project_team_members_string.concat(";");
        }
        console.log("project_team_members_string : " + project_team_members_string);

        res.render('project-search.ejs', {
      		title : 'Project info',
          project_name : project_name_to_search,
          project_description : project_description,
          project_budget : project_budget,
          project_team_members_string : project_team_members_string
      	});
      }
    });
  });
};
