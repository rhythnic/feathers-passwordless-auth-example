// Initializes the `mailer` service on path `/mailer`
const hooks = require('./mailer.hooks');
const Mailer = require('feathers-mailer');
const sendmailTransport = require('nodemailer-sendmail-transport');

module.exports = function () {
  const app = this;

  app.use('/mailer', Mailer(sendmailTransport({
    sendmail: true
    // see https://nodemailer.com/transports/sendmail/ for options
  })));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('mailer');

  service.hooks(hooks);
};
