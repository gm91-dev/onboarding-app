// routes file
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
  

  // route for creating a new project


  // route for searching an existing project

};
