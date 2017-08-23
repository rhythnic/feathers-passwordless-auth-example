const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const local = require('feathers-authentication-local');
const { iff, disallow } = require('feathers-hooks-common');


module.exports = function () {
  const app = this;
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local(config.local));

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        iff(hook => hook.data.strategy === 'local', disallow('external')),
        iff(hook => hook.data.strategy === 'local', hook => {
          const query = { email: hook.data.email }
          return hook.app.service('users').find({ query }).then(users => {
            hook.params.payload = { userId: users.data[0]._id }
            return hook
          })
        }),
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
