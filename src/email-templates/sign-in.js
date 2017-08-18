module.exports.html = `
<html>
<body style="margin: 0;font-family: sans-serif;">
  <header>
    <h2>Hi</h2>
  </header>
  <div>
    <p style="margin-bottom:24px;">Please follow the link below to sign in to my app.</p>
    <a href="{{hashLink}}">{{hashLink}}</a>
  </div>
</body>
</html>
`

module.exports.text = `
Hi!

Please follow the link below to sign in to my app.

{{hashLink}}
`
