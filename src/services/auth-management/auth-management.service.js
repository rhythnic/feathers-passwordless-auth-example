const authManagement = require('feathers-authentication-management');
const hooks = require('./auth-management.hooks');
const configureNotifier = require('./notifier');

module.exports = function () {
  const app = this;

  app.configure(authManagement({
    skipIsVerifiedCheck: true,
    sanitizeUserForClient (user) {
      // avoid returning the user to the client when not authorized
      return { email: user.email }
    },
    notifier: configureNotifier(app)
  }))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('authManagement');

  service.hooks(hooks);
};
