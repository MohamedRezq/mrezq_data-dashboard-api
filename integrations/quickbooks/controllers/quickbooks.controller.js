// const QuickBooks = require('quickbooks-oauth2');
const intuitOAuth = require('intuit-oauth');
const config = require('../config/config');
const { OrganizationApplication } = require('../../../models');

const oauthClient = new intuitOAuth(config);

exports.authorize = (req, res) => {
    const redirectUrl = req.query.redirectUrl;
    const authUri = oauthClient.authorizeUri({
      scope: [intuitOAuth.scopes.Accounting, intuitOAuth.scopes.OpenId],
      state: 'test',
      redirectUrl: redirectUrl
    });
  
    res.redirect(authUri);
};

exports.handleAuthorizationCallback = async (req, res) => {

  try {
      // Get the redirectUrl from the query parameter
      const redirectUrl = req.query.redirectUrl;

      const authResponse = await oauthClient.createToken(req.url);
      // Save the access token and refresh token to your database or session
      // The access token is used to make API calls to QuickBooks, and the refresh token is used to refresh the access token when it expires.

      const responseBody = JSON.parse(authResponse.body);
      const accessToken = responseBody.access_token;
      const refreshToken = responseBody.refresh_token;
      const tokenType = responseBody.token_type;
      const refreshTokenExpiresIn = responseBody.x_refresh_token_expires_in;
      const expiresIn = responseBody.expires_in;

      // Get the organization application ID from the request URL
      const organizationApplicationId = 1 //req.query.organization_application_id;
      const organization_id = 1
      const application_id = 1

      // Update the organization application record with the token details
      const updatedRecord = await OrganizationApplication.update(
        {
          integration_status: 'active',
          data: JSON.stringify({ accessToken, refreshToken, tokenType, expiresIn, refreshTokenExpiresIn }),
          updated_at: new Date()
        },
        {
          where: 
          { 
            // id: organizationApplicationId,
            organization_id: organization_id,
            application_id: application_id
          },
          returning: true,
        },
      );

      if (updatedRecord[0] === 0) {
        throw new Error('Organization application not found');
      }

      const response = {
        message: 'Authorization successful!',
        data: updatedRecord[1][0],
      };

      res.redirect(redirectUrl)
      // res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

    // const authResponse = await oauthClient.createToken(req.url);
  
    // // Save the access token and refresh token to your database or session
    // // The access token is used to make API calls to QuickBooks, and the refresh token is used to refresh the access token when it expires.
  
    // res.send('Authorization successful!');
  };
  
  

// exports.authorize = async (req, res) => {
//   const authUri = qbClient.authorizeUri({
//     scope: [
//       QuickBooks.scopes.Accounting,
//       QuickBooks.scopes.Payment,
//       QuickBooks.scopes.Profile,
//     ],
//     state: 'some_state',
//   });

//   res.redirect(authUri);
// };
