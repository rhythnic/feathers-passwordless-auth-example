const isProd = process.env.NODE_ENV === 'production'

module.exports = function configureNotifier(app) {
  function getLink (path) {
    const port = (app.get('port') === '80' || isProd) ? '' : ':' + app.get('port')
    const host = (app.get('host') === 'HOST') ? 'localhost' : app.get('host')
    let protocal = (app.get('protocal') === 'PROTOCAL') ? 'http' : app.get('protocal')
    return `${protocal}://${host}${port}/${path}`
  }

  function sendEmail (email) {
    return app.service('mailer')
      .create(email)
      .catch(err => { console.log('Error sending email', err) })
  }

  return function notifier(type, user, notifierOptions) {
    let email
    switch (type) {
      case 'sendResetPwd':
        return sendEmail({
          to: user.email,
          from: process.env.FROM_EMAIL,
          subject: 'Sign in to my app',
          template: 'signIn',
          data: {
            hashLink: getLink(`auth/email-token/${user.resetToken}`),
            name: user.name || user.email
          }
        })
      default:
        return Promise.resolve(user);
    }
  }
}
