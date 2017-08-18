const users = require('./users/users.service.js');
const mailer = require('./mailer/mailer.service.js');
const authManagement = require('./auth-management/auth-management.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(mailer);
  app.configure(authManagement);
};
