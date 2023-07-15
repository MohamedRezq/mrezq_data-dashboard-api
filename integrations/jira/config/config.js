// jira/config/config.js

module.exports = {
  clientId: process.env.JIRA_CLIENT_ID,
  clientSecret: process.env.JIRA_CLIENT_SECRET,
  redirectUri: process.env.JIRA_REDIRECT_URI,
  // environment: process.env.QB_ENVIRONMENT, // 'sandbox' or 'production'
  // QBSandBoxUrl: process.env.QB_SANDBOX_BASEURL,
  // QBProductionUrl: process.env.QB_PRODUCTION_BASEURL,
  // minorVersion: process.env.QB_MINORVERSION,
  // //TODO Which data to sync from Quickbooks?
  // syncedDataTypes: ["vendor", "invoice", "customer", "purchase"],
};
