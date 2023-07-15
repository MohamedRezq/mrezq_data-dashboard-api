const config = require("../config/config");
const axios = require("axios");
const { formQBClient, prepareData } = require("../utlis/utils");
const { vendorsCategorize } = require("../../../utils/vendorsCategorize");
const {
  OrganizationApplication,
  Application,
  Subscription,
  SyncLog,
} = require("../../../models");
//---------------------------------------------------------------//
exports.handleCodeExchange = async (req, res) => {
  const oauthClient = formQBClient();
  const urlParams = new URLSearchParams(req.body.url);
  const companyId = urlParams.get("realmId");
  let authResponse;
  try {
    authResponse = await oauthClient.createToken(req.body.url);
  } catch (error) {
    console.log("error: ", error);
    return res
      .status(error.response.status)
      .send({ message: error.response.statusText });
  }
  const responseBody = JSON.parse(authResponse.body);
  const accessToken = responseBody.access_token;
  const refreshToken = responseBody.refresh_token;
  const tokenType = responseBody.token_type;
  const refreshTokenExpiresIn = responseBody.x_refresh_token_expires_in;
  const expiresIn = responseBody.expires_in;
  //-------------------------------------------------------------------//
  try {
    const [foundOrgApp] = await OrganizationApplication.findOrCreate({
      where: {
        organization_id: req.body.organizationId,
        application_id: req.body.applicationId,
      },
      defaults: {
        organization_id: req.body.organizationId,
        application_id: req.body.applicationId,
        integration_status: "active",
        data: JSON.stringify({
          accessToken,
          refreshToken,
          companyId,
          tokenType,
          expiresIn,
          refreshTokenExpiresIn,
        }),
      },
    });
    if (foundOrgApp) {
      await OrganizationApplication.update(
        {
          integration_status: "active",
          data: JSON.stringify({
            accessToken,
            refreshToken,
            companyId,
            tokenType,
            expiresIn,
            refreshTokenExpiresIn,
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
      return res.status(200).json({
        message: "Authorization Successful!",
      });
    }
    return res.status(201).json({
      message: "Authorization Successful!",
    });
  } catch (error) {
    console.log("error: ", error);
    //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
    if (error.errors)
      return res.status(500).send({ message: error.errors[0].message });
    //sequilize error object has property name -> in case of foreign key constraint error
    else return res.status(500).send({ message: error.name });
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
        application_id: 1,
      },
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "QuickBooks not found for your organization" });
    }
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  if (application.integration_status === "active") {
    let data = JSON.parse(application.data);
    const oauthClient = formQBClient(data);
    let newTokens = {};
    try {
      newTokens = await oauthClient.refresh();
    } catch (error) {
      console.log("error: ", error);
      return res
        .status(error.authResponse.response.status)
        .send({ message: error.authResponse.response.statusText });
    }
    try {
      await OrganizationApplication.update(
        {
          data: JSON.stringify({
            accessToken: newTokens.token.access_token,
            refreshToken: newTokens.token.refresh_token,
            companyId: data.companyId,
            tokenType: newTokens.token.token_type,
            expiresIn: newTokens.token.expires_in,
            refreshTokenExpiresIn: newTokens.token.x_refresh_token_expires_in,
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
      console.log("error: ", error);
      //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
      if (error.errors)
        return res.status(500).send({ message: error.errors[0].message });
      //sequilize error object has property name -> in case of foreign key constraint error
      else return res.status(500).send({ message: error.name });
    }
    return res.status(200).send({ message: "tokens renewed" });
  }
};
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.syncData = async (req, res) => {
  let QBData = {};
  let foundOrgApp;
  const start_time = Date.now();
  //---------------------------------------------------------//
  //get quickbooks application for organization from req.body
  try {
    foundOrgApp = await OrganizationApplication.findOne({
      where: {
        organization_id: req.body.organizationId,
        application_id: 1,
        integration_status: "active",
      },
    });
    if (!foundOrgApp) {
      return res
        .status(404)
        .json({ message: "QuickBooks not found for your organization" });
    }
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  //get vendors & invoices for quickbooks application
  try {
    let data = JSON.parse(foundOrgApp.data);
    const [vendors, invoices, customers, purchases] = await Promise.all(
      config.syncedDataTypes.map((dataType, i) => {
        return axios.get(
          `${config.QBSandBoxUrl}/v3/company/${data.companyId}/query?query=select * from ${dataType}&minorversion=${config.minorVersion}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.accessToken}`,
            },
          }
        );
      })
    );
    QBData = {
      ...QBData,
      vendors: vendors.data.QueryResponse.Vendor,
      invoices: invoices.data.QueryResponse.Invoice,
      customers: customers.data.QueryResponse.Customer,
      purchases: purchases.data.QueryResponse.Purchase,
    };
    //-------------------------------------------------------------------//
    //-------------------------------------------------------------------//
    //-------------------------------------------------------------------//
    for await (const vendor of QBData.vendors) {
      try {
        //-------------------------------------------------------------------//
        const mappedVendor = vendorsCategorize(vendor.DisplayName);
        //find single application, if not found create
        const [foundApp, createdApp] = await Application.findOrCreate({
          where: {
            name: mappedVendor.name,
          },
          defaults: {
            name: mappedVendor.name,
            description: vendor.PrintOnCheckName,
            category_id: mappedVendor.catId,
            logo_url: null,
            active: 1,
            created_at: Date.now(),
            updated_at: Date.now(),
          },
        });
        const App = foundApp || createdApp;
        //------------------------------------------------------------------//
        //find organization application, if found update, if not found create
        const [foundOrgApp] = await OrganizationApplication.findOrCreate({
          where: {
            organization_id: req.body.organizationId,
            vendor_name: App.name,
          },
          defaults: {
            organization_id: req.body.organizationId,
            application_id: App.id,
            vendor_name: App.name,
            vendor_id: vendor.Id,
            integration_status: "disabled",
          },
        });
        if (foundOrgApp) {
          await OrganizationApplication.update(
            {
              vendor_id: vendor.Id,
              updated_at: Date.now(),
            },
            {
              where: {
                id: foundOrgApp.id,
              },
            }
          );
        }
      } catch (error) {
        console.log("error: ", error);
        //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
        if (error.errors)
          return res.status(500).send({ message: error.errors[0].message });
        //sequilize error object has property name -> in case of foreign key constraint error
        else return res.status(500).send({ message: error.name });
      }
    }
    //-------------------------------------------------------------------//
    //-------------------------------------------------------------------//
    //-------------------------------------------------------------------//
    for await (const purchase of QBData.purchases) {
      try {
        if (purchase.EntityRef) {
          const mappedVendor = vendorsCategorize(purchase.EntityRef.name);
          const foundOrgApp = await OrganizationApplication.findOne({
            where: {
              organization_id: req.body.organizationId,
              vendor_name: mappedVendor.name,
            },
          });
          if (foundOrgApp) {
            const [foundSubs, createdSubs] = await Subscription.findOrCreate({
              where: {
                organization_id: req.body.organizationId,
                subscription_id: purchase.Id,
              },
              defaults: {
                organization_id: req.body.organizationId,
                organization_application_id: foundOrgApp.id,
                subscription_id: purchase.Id,
                renewal_start_date: purchase.TxnDate, //
                data_source: 1,
                data_source_type: "finance_app",
                total_contract_value: purchase.TotalAmt,
                vendor_id: purchase.EntityRef.value,
                vendor_name: mappedVendor.name,
                vendor_category: mappedVendor.catId,
              },
            });
          }
        }
      } catch (error) {
        console.log("error: ", error);
        //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
        if (error.errors)
          return res.status(500).send({ message: error.errors[0].message });
        //sequilize error object has property name -> in case of foreign key constraint error
        else return res.status(500).send({ message: error.name });
      }
    }
  } catch (error) {
    console.log("error: ", error);
    return res
      .status(error.response.status)
      .send({ message: error.response.data.message });
  }
  //---------------------------------------------------------//
  //create synclog if everything is ok
  try {
    await SyncLog.create({
      organization_id: req.body.organizationId,
      organization_application_id: foundOrgApp.id,
      sync_target: "finance",
      sync_type: "manual",
      data: JSON.stringify(QBData),
      sync_status: "success",
      start_time: start_time,
      end_time: new Date(),
      created_at: new Date(),
      active: 1,
    });
  } catch (error) {
    //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
    if (error.errors) return res.status(500).send(error.errors[0].message);
    //sequilize error object has property name -> in case of foreign key constraint error
    else return res.status(500).send(error.name);
  }
  //---------------------------------------------------------//
  //get dashboard data for single organization from tables data
  const appData = await prepareData(req.body.organizationId);
  res.status(200).send(appData);
};

//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.getData = async (req, res) => {
  //---------------------------------------------------------//
  //get dashboard data for single organization from tables data
  const appData = await prepareData(req.body.organizationId);
  res.status(200).send(appData);
};
