// Initializes the `mailer` service on path `/mailer`
const hooks = require('./mailer.hooks');
const Mailer = require('feathers-mailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function () {
  const app = this;

  app.use('/mailer', Mailer(smtpTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_SECRET
    }
  })));

  // Initialize our service with any options it requires
  app.use('/mailer', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('mailer');

  service.hooks(hooks);
};
