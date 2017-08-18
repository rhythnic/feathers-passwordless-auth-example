const { iff, disallow } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(hook => hook.data.action === 'resetPwdLong', hook => {
        hook.data.value.password = ''
        return Promise.resolve(hook)
      })
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(hook => hook.data.action === 'resetPwdLong', hook => {
        const { app, result } = hook
        return app.service('authentication').create({
          strategy: 'local',
          email: result.email
        })
        .then(({ accessToken }) => {
          result.accessToken = accessToken
          return hook;
        })
      })
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
