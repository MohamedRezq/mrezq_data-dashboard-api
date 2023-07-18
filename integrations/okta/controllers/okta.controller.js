const config = require("../config/config");
const axios = require("axios");
const { OrganizationApplication, User } = require("../../../models");
//---------------------------------------------------------------//
exports.handleCodeExchange = async (req, res) => {
  const {
    code,
    organizationId,
    applicationId,
    userId,
    oktaDomain,
    oktaClientId,
    oktaClientSecret,
  } = req.body;
  let user;
  let response;
  //--------------------------------------------------------------//
  try {
    user = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    user.data = JSON.stringify({
      oktaClientId: oktaClientId,
      oktaClientSecret: oktaClientSecret,
      oktaDomain: oktaDomain,
    });
    user.updated_at = new Date();
    await user.save();
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
  //--------------------------------------------------------------//
  try {
    response = await axios.post(
      `https://${oktaDomain}.okta.com/oauth2/v1/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
        code: code,
        scope: "openid offline_access",
      }),
      {
        headers: {
          accept: "application/json",
          authorization: `Basic ${Buffer.from(
            `${oktaClientId}:${oktaClientSecret}`
          ).toString("base64")}`,
        },
      }
    );
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).send({ message: "Bad request" });
  }
  //--------------------------------------------------------------//
  try {
    const [foundOrgApp] = await OrganizationApplication.findOrCreate({
      where: {
        organization_id: organizationId,
        application_id: applicationId,
      },
      defaults: {
        organization_id: organizationId,
        application_id: applicationId,
        integration_status: "active",
        data: JSON.stringify({
          ...response.data,
        }),
      },
    });
    if (foundOrgApp) {
      await OrganizationApplication.update(
        {
          integration_status: "active",
          data: JSON.stringify({
            ...response.data,
          }),
          updated_at: new Date(),
        },
        {
          where: {
            id: foundOrgApp.id,
          },
          returning: true,
        }
      );
      return res.status(200).send({
        message: "Authorization Successful!",
      });
    }
    return res.status(201).send({
      message: "Authorization Successful!",
    });
  } catch (error) {
    console.log("err: ", error);
    //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
    if (error.errors)
      return res.status(500).send({ message: error.errors[0].message });
    //sequilize error object has property name -> in case of foreign key constraint error
    else return res.status(500).send({ message: error.name });
  }
  //--------------------------------------------------------------//
};
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.validateTokens = async (req, res) => {
  let user;
  //--------------------------------------------------------------//
  try {
    user = await User.findOne({
      where: {
        id: req.body.userId,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  //--------------------------------------------------------------//
  const { oktaDomain, oktaClientId, oktaClientSecret } = JSON.parse(user.data);
  //---------------------------------------------------------//
  //get application for single organization from req.body
  let application;
  try {
    application = await OrganizationApplication.findOne({
      where: {
        organization_id: req.body.organizationId,
        application_id: 6,
      },
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "Okta not found for your organization" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  if (application.integration_status === "active") {
    let data = JSON.parse(application.data);
    let newTokens;
    try {
      newTokens = await axios.post(
        `https://${oktaDomain}/oauth2/v1/token`,
        new URLSearchParams({
          grant_type: "refresh_token",
          redirect_uri: config.redirectUri,
          scope: "offline_access openid",
          refresh_token: data.refresh_token,
        }),
        {
          headers: {
            accept: "application/json",
            authorization: `Basic ${Buffer.from(
              `${oktaClientId}:${oktaClientSecret}`
            ).toString("base64")}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
      return res
        .status(error.response.status)
        .send({ message: error.response.data.message });
    }
    try {
      await OrganizationApplication.update(
        {
          data: JSON.stringify({
            ...newTokens.data,
          }),
          updated_at: new Date(),
        },
        {
          where: {
            organization_id: application.organization_id,
            application_id: application.application_id,
          },
        }
      );
    } catch (error) {
      //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
      if (error.errors)
        return res.status(500).send({ message: error.errors[0].message });
      //sequilize error object has property name -> in case of foreign key constraint error
      else return res.status(500).send({ message: error.name });
    }
    return res.status(200).send({ message: "tokens renewed" });
  }
};
