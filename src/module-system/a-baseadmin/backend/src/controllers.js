const role = require('./controller/role.js');
const user = require('./controller/user.js');
const atomRight = require('./controller/atomRight.js');
const auth = require('./controller/auth.js');

module.exports = app => {
  const controllers = {
    role,
    user,
    atomRight,
    auth,
  };
  return controllers;
};
