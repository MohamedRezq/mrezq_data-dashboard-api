const axios = require("axios");
const FormData = require("form-data");
const {
  OrganizationApplication,
  SyncLog,
  Application,
  Subscription,
} = require("../../../models");
const { prepareData } = require("../../quickbooks/utlis/utils");
const {
  clientId,
  clientSecret,
  redirectUri,
  ZOHO_SANDBOX_URL,
} = require("../config/config");
const { vendorsCategorize } = require("../../../utils/vendorsCategorize");
//---------------------------------------------------------------//
exports.handleCodeExchange = async (req, res) => {
  const { code, organizationId, applicationId } = req.body;
  try {
    const formData = new FormData();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("redirect_uri", redirectUri);
    formData.append("code", code);
    const response = await axios.post(
      `https://accounts.zoho.com/oauth/v2/token`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    try {
      const company = await axios.get(
        `${ZOHO_SANDBOX_URL}/books/v3/organizations`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Zoho-oauthtoken ${response.data.access_token}`,
          },
        }
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
              organizations: company.data.organizations.map(
                (org) => org.organization_id
              ), //could be array
            }),
          },
        });
        if (foundOrgApp) {
          await OrganizationApplication.update(
            {
              integration_status: "active",
              data: JSON.stringify({
                ...response.data,
                organizations: company.data.organizations.map(
                  (org) => org.organization_id
                ), //could be array
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
        //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
        if (error.errors)
          return res.status(500).send({ message: error.errors[0].message });
        //sequilize error object has property name -> in case of foreign key constraint error
        else return res.status(500).send({ message: error.name });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(error.response.status)
        .send({ message: error.response.data.message });
    }
  } catch (error) {
    return res
      .status(error.response.status)
      .send({ message: error.response.data.message });
  }
};
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
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
        application_id: 2,
      },
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "ZohoBooks not found for your organization" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  if (application.integration_status === "active") {
    let data = JSON.parse(application.data);
    let newTokens = {};
    try {
      const formData = new FormData();
      formData.append("grant_type", "refresh_token");
      formData.append("client_id", clientId);
      formData.append("client_secret", clientSecret);
      formData.append("refresh_token", data.refresh_token);
      newTokens = await axios.post(
        `https://accounts.zoho.com/oauth/v2/token`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.syncData = async (req, res) => {
  const start_time = Date.now();
  let foundOrgApp;
  let ZBData = {};
  //---------------------------------------------------------//
  //get zohobooks application for organization from req.body
  try {
    foundOrgApp = await OrganizationApplication.findOne({
      where: {
        organization_id: req.body.organizationId,
        application_id: 2,
        integration_status: "active",
      },
    });
    if (!foundOrgApp) {
      return res
        .status(404)
        .json({ message: "ZohoBooks not found for your organization" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  //get vendors & invoices for zohobooks application
  try {
    let data = JSON.parse(foundOrgApp.data);
    const organizations = data.organizations;
    const now = new Date().getTime();
    const fiveYears = 1.578e11;
    const startDate = new Date(now - fiveYears).toLocaleDateString("sv");
    //---------------------------------------//
    for await (const organization_id of organizations) {
      let loops = Array(100).fill("a");
      let page = 1;
      let vendorsArr = [];
      for await (const loop of loops) {
        const vendors = await axios.get(
          `${ZOHO_SANDBOX_URL}/books/v3/vendorpayments?organization_id=${organization_id}&date_after=${startDate}&page=${page}&per_page=${200}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Zoho-oauthtoken ${data.access_token}`,
            },
          }
        );
        vendorsArr = [...vendorsArr, ...vendors.data.vendorpayments];
        if (vendors.data.page_context.has_more_page === false) break;
        else if (vendors.data.page_context.has_more_page === true) page += 1;
      }
      ZBData = {
        ...ZBData,
        vendors: [...vendorsArr],
      };
      // console.log(ZBData.vendors);
      //-------------------------------------------------------------------//
      //-------------------------------------------------------------------//
      //-------------------------------------------------------------------//
      for await (const vendor of ZBData.vendors) {
        try {
          const mappedVendor = vendorsCategorize(vendor.vendor_name);
          //-------------------------------------------------------------------//
          //find single application, if not found create
          const [foundApp, createdApp] = await Application.findOrCreate({
            where: {
              name: mappedVendor.name,
            },
            defaults: {
              name: mappedVendor.name,
              description: vendor.description,
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
          const [foundOrgApp, createdOrgApp] =
            await OrganizationApplication.findOrCreate({
              where: {
                organization_id: req.body.organizationId,
                application_id: App.id,
              },
              defaults: {
                organization_id: req.body.organizationId,
                application_id: App.id,
                vendor_name: mappedVendor.name,
                vendor_id: vendor.vendor_id,
                integration_status: "disabled",
              },
            });
          if (foundOrgApp) {
            await OrganizationApplication.update(
              {
                vendor_id: vendor.vendor_id,
                updated_at: Date.now(),
              },
              {
                where: {
                  id: foundOrgApp.id,
                },
              }
            );
          }
          const orgApp = foundOrgApp || createdOrgApp;
          //------------------------------------------------------------------//
          //find subscription, if found update, if not found create
          await Subscription.findOrCreate({
            where: {
              organization_id: req.body.organizationId,
              subscription_id: vendor.payment_id,
            },
            defaults: {
              organization_id: req.body.organizationId,
              organization_application_id: orgApp.id,
              subscription_id: vendor.payment_id,
              renewal_start_date: vendor.date, //
              data_source: 2,
              data_source_type: "finance_app",
              total_contract_value: vendor.amount,
              vendor_id: vendor.vendor_id,
              vendor_category: mappedVendor.catId,
              vendor_name: mappedVendor.name,
            },
          });
        } catch (error) {
          console.log(error);
          //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
          if (error.errors)
            return res.status(500).send({ message: error.errors[0].message });
          //sequilize error object has property name -> in case of foreign key constraint error
          else return res.status(500).send({ message: error.name });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400) //The zohobooks api has bug returning 200 in case of error, so status code is forced=400
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
      data: JSON.stringify(ZBData),
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
  //get dashboard data for single organization from tables data
  const appData = await prepareData(req.body.organizationId);
  res.status(200).send(appData);
};
