const config = require("../config/config");
const axios = require("axios");
// const { formQBClient, prepareData } = require("../../quickbooks/utlis/utils");
// const { vendorsCategorize } = require("../../../utils/vendorsCategorize");
const {
  OrganizationApplication,
  Application,
  Subscription,
  SyncLog,
} = require("../../../models");
//---------------------------------------------------------------//
exports.handleCodeExchange = async (req, res) => {
  const { code, organizationId, applicationId } = req.body;
  console.log("code: ", code);
  try {
    const response = await axios.post(
      `https://auth.atlassian.com/oauth/token`,
      {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: config.redirectUri,
      },
      { headers: { "Content-Type": "application/json" } }
    );
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
  } catch (error) {
    console.log("error: ", error.response.data);
    return res
      .status(error.response.status)
      .send({ message: error.response.data.message });
  }
};
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.validateTokens = async (req, res) => {
  //---------------------------------------------------------//
  //get application for single organization from req.body
  let application;
  try {
    application = await OrganizationApplication.findOne({
      where: {
        organization_id: req.body.organizationId,
        application_id: 5,
      },
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "Jira not found for your organization" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  if (application.integration_status === "active") {
    let data = JSON.parse(application.data);
    let newTokens = {};
    try {
      newTokens = await axios.post(
        `https://auth.atlassian.com/oauth/token`,
        {
          grant_type: "authorization_code",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: code,
          redirect_uri: config.redirectUri,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return res
        .status(error.response.status)
        .send({ message: error.response.data.message });
    }
    try {
      await OrganizationApplication.update(
        {
          data: JSON.stringify({
            ...data,
            accessToken: newTokens.data.access_token,
          }),
          updated_at: new Date(),
        },
        {
          where: {
            organization_id: application.organization_id,
            application_id: application.application_id,
          },
          returning: true,
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
