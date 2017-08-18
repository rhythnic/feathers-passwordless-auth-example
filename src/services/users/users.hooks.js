const { authenticate } = require('feathers-authentication').hooks;
const { iff, isProvider, preventChanges, when, discard } = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');
const verifyHooks = require('feathers-authentication-management').hooks;

function removeVerificationProperties (user) {
  delete user.verifyExpires;
  delete user.resetExpires;
  delete user.verifyChanges;
  delete user.verifyToken;
  delete user.verifyShortToken;
  delete user.resetToken;
  delete user.resetShortToken;
}

const preventVerificationPropertyChanges =
  iff(isProvider('external'), preventChanges(
    'isVerified',
    'verifyToken',
    'verifyShortToken',
    'verifyExpires',
    'verifyChanges',
    'resetToken',
    'resetShortToken',
    'resetExpires'
  ))

const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ ...restrict ],
    create: [
      verifyHooks.addVerification()
    ],
    update: [
      ...restrict,
      preventVerificationPropertyChanges
    ],
    patch: [
      ...restrict,
      preventVerificationPropertyChanges
    ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      when(
        hook => hook.params.provider,
        discard('password')
      )
    ],
    find: [
      iff(isProvider('external'), hook => {
        if (Array.isArray(hook.result.data)) {
          hook.result.data.forEach(removeVerificationProperties)
        }
        return Promise.resolve(hook)
      })
    ],
    get: [
      iff(isProvider('external'), verifyHooks.removeVerification())
    ],
    create: [
      verifyHooks.removeVerification()
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
