const { disallow } = require('feathers-hooks-common');
const Handlebars = require('handlebars')
const signIn = require('../../email-templates/sign-in')

const templates = {
  signIn: {
    html: Handlebars.compile(signIn.html),
    text: Handlebars.compile(signIn.text)
  }
}

module.exports = {
  before: {
    all: [
      disallow('external')
    ],
    create: [
      hook => {
        const template = templates[hook.data.template]
        if (!template) {
          return Promise.reject(new Error(`Unknown email template: ${hook.data.template}`))
        }
        if (template.html) hook.data.html = template.html(hook.data.data)
        if (template.text) hook.data.text = template.text(hook.data.data)
        delete hook.data.data
        delete hook.data.template
        return Promise.resolve(hook)
      }
    ]
  },
  after: {
    create: [
      hook => {
        const email = hook.data
        console.log(`Sent email to ${email.to} with subject: ${email.subject}`)
        return Promise.resolve(hook)
      }
    ]
  }
};
