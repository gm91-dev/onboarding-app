/*
** This file contains all the functions related to the user profile
*/
module.exports.checkUserFields = function () {
  var ret = false;
  if( $.trim($('#email').val()) != '' &&
      $.trim($('#name').val()) != '' &&
      $.trim($('#surname').val()) != '' &&
      $.trim($('#role').val()) != '' &&
      $.trim($('#telephone').val()) != '' //&&
    /*$.trim($('#descritpion').val()) != ''*/) {
        ret = true;
      }
  return ret;
}
module.exports.clearUserFields = function () {
  $('#email').val('');
  $('#name').val('');
  $('#surname').val('');
  $('#role').val('');
  $('#telephone').val('');
  $('#description').val('');
}

module.exports.addNewUser = function (userData) {
  // parse the user data fields
  //
  // store user data into the database (to be checked which database, sql or nosql, to use)
  //
};
