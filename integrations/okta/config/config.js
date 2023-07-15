// okta/config/config.js

module.exports = {
  clientId: process.env.OKTA_CLIENT_ID,
  clientSecret: process.env.OKTA_CLIENT_SECRET,
  redirectUri: process.env.OKTA_REDIRECT_URI,
  base64Auth: process.env.OKRA_AUTH_BASE64_ENCODED,
};
