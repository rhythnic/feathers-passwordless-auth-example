// *************************************************************************
// Client code isn't working yet
// It's here for showing code examples.
// *************************************************************************

// Configure Feathers client
const socket = io()
const client = feathers()
  .configure(feathers.hooks())
  .configure(feathers.socketio(socket))
  .configure(feathers.authentication({
    storage: window.localStorage
  }))

const authManagement = client.service('authManagement');


// Get user's email address and initiate email sending
const form = document.getElementById('loginForm')
form.addEventListener('submit', evt => {
  evt.preventDefault()
  const email = form.elements['email'].value
  authManagement.create({
    action: 'sendResetPwd',
    value: { email }
  })
  .catch(console.error)
})

// after user navigates from their email
// get resetToken from route and exchange it for an access token
const emailTokenIndex = window.location.pathname.indexOf('email-token')
if (emailTokenIndex > -1) {
  const resetToken = window.location.pathname.slice(emailTokenIndex).split('/')[1]
  authManagement.create({ action: 'resetPwdLong', token: resetToken })
  .then(result => {
    debugger
    return client.authenticate({
      strategy: 'jwt',
      token: result.accessToken
    })
    .then(() => client.service('users').find({ query: { email: result.email } }))
  })
  .then(users => {
    console.log('user', users.data[0])
  })
}



//logout
document.getElementById('logoutBtn').addEventListener('click', evt => {
  client.logout().then(() => { console.log('logged out') })
})
