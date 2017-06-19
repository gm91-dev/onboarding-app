// routes file
var postgresql_db_controller = require('../controller/compose-postgresql-connection');
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
  	res.render('admin-profile.ejs', {
  		title : 'Admin profile'
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

    // storing data into database
    //postgresql_db_controller.postgresql_save_user(email, name, surname, role, telephone, description);

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

  });

  // route for creating a new project


  // route for searching an existing project

};
