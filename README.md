# feathers-passwordless-auth-example

> Example of passwordless authentication in FeathersJS

## About

This project uses [Feathers](http://feathersjs.com). It accomplishes a passwordless authentication
strategy by using local authentication and the reset-password functionality from the
[feathers-authentication-management](https://github.com/feathersjs/feathers-authentication-management) package.

## Run the app
- clone the repo
- cd into the directory
- run `npm start`

The client-side isn't functioning yet.  I need to add a simple client-side router.
Right now, the client-side code is only for showing code examples.

## Recreate the Example
Example repos have package versions that quickly fall out of date.  For that reason,
and so that you can integrate the passwordless strategy into an existing Feathers app,
I've include the list of steps to show how the example app was created.

### Generate app
Use the feathers-cli to generate the initial app structure.
Use the default options for `feathers generate authentication`, but choose the options
for the database you're using.

```
mkdir example-app
cd example-app
feathers generate app
feathers generate authentication
```

### Config
In `config/default.json`, set the value of `authentication.local.passwordField` to "email"
We're using the local auth strategy, but users won't actually have a password.

Also add the keys "protocal" and "src" keys to your config.  We'll need these to build
this link that we put in the email.

### User hooks file
There's too much code to include in this list of steps, but just copy/paste all of
`src/services/users/users.hooks.js`.
In the code changes, we are:

1.  Removing all the `hashPassword` hooks, to prevent the email address from getting hashed.
    Since we set the email address as the password field, it would get hashed if we don't
    remove all the calls to `hashPassword`
2.  Add/Remove verification properties on user objects, and prevent those properties from
    getting changed by external providers (rest/socket.io)

### User model
If you have a user model in `src/models/users.model.js`, add these properties.

```
isVerified: { type: Boolean },
verifyToken: { type: String },
verifyExpires: { type: Date },
verifyChanges: { type: Object },
resetToken: { type: String },
resetExpires: { type: Date }
```

### Authentication service
In `authentication.js`, before the existing create hook, add 2 hooks.
- The first hook disallows local authentication from external providers.
- The second hook puts the userId onto params.payload so that it gets into the jwt token.

```
const { iff, disallow } = require('feathers-hooks-common');

...

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
```

### Email templates
Add a folder for your email templates.  This repo uses Handlebars for email templates.
The email file exports html and plain text.
`src/email-templates/sign-in.js`

### Mailer Service
Add a service for sending emails.  This will vary according to your email provider.

```
feathers generate service
```

I called the service 'mailer', and set it up as custom service.  Choose "No" for authentication.

The `mailer.service.js` file is setup to use `feathers-mailer` and `nodemailer-smtp-transport`
We also introduce some environment variables for keeping track of credentials that shouldn't be
in the code.  I like to use [dotenv](https://github.com/motdotla/dotenv) for loading environment variables.

In `mailer.hooks.js`, disallow all external providers, in the `before all` hooks array.
In this file, we're precompiling email templates and associating them with a key.  Since we'll be
sending a lot of emails, it's best to precompile the handlebar templates so that the emails are
sent faster.  When you call create on the mailer service, you'll pass in a `template` key and a data
object.  The hook will take care of compiling the email.

### Authentication Management Service
As mentioned, we're using the reset password flow from the
[feathers-authentication-management](https://github.com/feathersjs/feathers-authentication-management)
package to achieve a passwordless auth strategy.

```
feathers generate service
```

Name it "authManagement" and change the path to "/authManagement".  Choose "No" for authentication.

### notifier
The `feathers-authentication-management` package uses a "notifier" function, which listens for
various auth management actions and calls "create" on the mailer service with a payload that
includes all the data needed to compose the email.  Copy/paste the `src/services/auth-management/notifier.js`
file from this repo.  It currently only listens for "sendResetPwd", but you can listen to any of the
actions supported by the auth management package.

### auth-management.service.js
Copy/paste the configuration for the auth-management package.

We set `skipIsVerifiedCheck` to allow us avoid having to make the user verify their email address.
They are essentially verifying it when they sign in.

Include a `sanitizeUserForClient` function to prevent sending user info to client prior to authentication.
We need the email address though, so only send that.

### auth-management.hooks.js
In this file, we add a `before create` hook and an `after create` hook.

After the user clicks on the link in the email, the app will create a 'resetPwdLong' action.
This action requires a password.  We're not using passwords, so in the `before create` hook,
we provide an empty string to bypass the error caused by not having a password.

In the `after create` hook, again for the 'resetPwdLong' action, use the authentication service
to get an access token and attach it to the result so it get's sent to the user.

### Sign in on client
This repo doesn't use the `feathers-authentication-management` client library.
I got an error when using it.  I may have used in incorrectly, but it's not needed anyway.
When you get the email address from the input field, create a 'sendResetPwd' action.
```
// const app = feathers()
// const authManagement = app.service('authManagement')

authManagement.create({
  action: 'sendResetPwd',
  value: { email }
})

```

This will cause an email to be sent.


### Handle navigation from email
Client code will vary a lot, but make a route that matches the link in the email.
In that way, you can get the resetToken from a route param.

Note:  put the token in a route path param and not a query param.
I orignally put the token in a query param and this caused problems
when the user clicked on the email link, but it worked when the link is copy/pasted into
the address bar. The problem may be related to Nuxt, but i would use a route path param to be safe.

When you have the reset token, create a "resetPwdLong" action.  You'll get back the email
address and access token.  You can then use these to authenticate and fetch the user.

```
authManagement.create({ action: 'resetPwdLong', token: resetToken })
  .then(result => {
    return app.authenticate({
      strategy: 'jwt',
      token: result.accessToken
    })
    .then(() => app.service('users').find({ query: { email: result.email } }))
  })
  .then(users => {
    console.log('user', users.data[0])
  })
})
```

## Conclusion
Thanks to the nice people on the Feathers Slack channel for helping me figure this out.
Thanks to [this tutorial](https://blog.feathersjs.com/how-to-setup-email-verification-in-feathersjs-72ce9882e744)
from where I took some code.

## Contribute
Contributions and improvements always welcome.  Please start with making an issue.
