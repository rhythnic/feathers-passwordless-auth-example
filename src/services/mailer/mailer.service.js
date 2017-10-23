// Initializes the `mailer` service on path `/mailer`
const hooks = require('./mailer.hooks');
const Mailer = require('feathers-mailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function () {
  const app = this;

  app.use('/mailer', Mailer(smtpTransport({
    sendmail: true
    // see https://nodemailer.com/smtp/ for options
  })));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('mailer');

  service.hooks(hooks);
};
