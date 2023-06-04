// quickbooks/config/config.js

module.exports = {
    clientId: process.env.QB_CLIENT_ID,
    clientSecret: process.env.QB_CLIENT_SECRET,
    redirectUri: process.env.QB_REDIRECT_URI,
    environment: process.env.QB_ENVIRONMENT, // 'sandbox' or 'production'
  };