const axios = require("axios");
const FormData = require("form-data");
const {
  OrganizationApplication,
  SyncLog,
  Employee,
  Department,
} = require("../../../models");
const {
  clientId,
  clientSecret,
  redirectUri,
  zohoPeopleUrl,
} = require("../config/config");
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
      //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
      if (error.errors)
        return res.status(500).send({ message: error.errors[0].message });
      //sequilize error object has property name -> in case of foreign key constraint error
      else return res.status(500).send({ message: error.name });
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
        application_id: 3,
      },
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "ZohoPeople not found for your organization" });
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
        .status(error.response?.status)
        .send({ message: error.response?.data?.message });
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
  let ZPData = {};
  //--------------------------------------------------//
  //--------------------------------------------------//
  //--------------------------------------------------//
  //get zohopeople application for organization from req.body
  try {
    foundOrgApp = await OrganizationApplication.findOne({
      where: {
        organization_id: req.body.organizationId,
        application_id: 3,
        integration_status: "active",
      },
    });
    if (!foundOrgApp) {
      return res
        .status(404)
        .json({ message: "ZohoPeople not found for your organization" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
  //--------------------------------------------------//
  //--------------------------------------------------//
  //--------------------------------------------------//
  let data = JSON.parse(foundOrgApp.data);
  //--------------------------------------------------//
  //--------------------------------------------------//
  //--------------------------------------------------//
  //get departments for zohopeople application
  try {
    let loops = Array(10).fill("a");
    let sIndex = 1;
    let departmentsArr = [];
    for await (const loop of loops) {
      const departments = await axios.get(
        `${zohoPeopleUrl}forms/department/getRecords?sIndex=${sIndex}&limit=200`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Zoho-oauthtoken ${data.access_token}`,
          },
        }
      );
      //if there is returned data --> departments.data.response.result=[],
      //otherwise departments.data.response.result doesn't exist
      if (departments.data.response.result?.length > 0) {
        departments.data.response.result.map((obj) => {
          const key = Object.keys(obj)[0];
          const department = obj[key][0];
          departmentsArr = [
            ...departmentsArr,
            { ...department, department_id: key },
          ];
        });
        sIndex += 200;
      } else break;
    }
    ZPData = {
      ...ZPData,
      departments: [...departmentsArr],
    };
    for await (const department of ZPData.departments) {
      const [foundDep] = await Department.findOrCreate({
        where: {
          organization_id: req.body.organizationId,
          department_id: department.department_id,
        },
        defaults: {
          organization_id: req.body.organizationId,
          department_id: department.department_id,
          head_id: department["Department_Lead.ID"] || null,
          name: department.Department,
          active: 1,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      });
      if (foundDep) {
        await Department.update(
          {
            head_id: department["Department_Lead.ID"] || null,
            name: department.Department,
            active: 1,
            updated_at: Date.now(),
          },
          {
            where: {
              id: foundDep.id,
            },
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(error.response.status).send({
      message:
        error?.response?.data?.message ||
        error?.response?.data?.response?.errors?.message,
    }); //zohopeople error object is different from zohobooks
  }
  //--------------------------------------------------//
  //--------------------------------------------------//
  //--------------------------------------------------//
  //get employees for zohopeople application
  try {
    let loops = Array(100).fill("a");
    let sIndex = 1;
    let employeesArr = [];
    for await (const loop of loops) {
      const employees = await axios.get(
        `${zohoPeopleUrl}forms/employee/getRecords?sIndex=${sIndex}&limit=200`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Zoho-oauthtoken ${data.access_token}`,
          },
        }
      );
      //if there is returned data --> employees.data.response.result=[],
      //otherwise employees.data.response.result doesn't exist
      if (employees.data.response.result?.length > 0) {
        employees.data.response.result.map((obj) => {
          const key = Object.keys(obj)[0];
          const employee = obj[key][0];
          employeesArr = [...employeesArr, { ...employee, employee_id: key }];
        });
        sIndex += 200;
      } else break;
    }
    ZPData = {
      ...ZPData,
      employees: [...employeesArr],
    };
    for await (emp of ZPData.employees) {
      const [foundEmp] = await Employee.findOrCreate({
        where: {
          organization_id: req.body.organizationId,
          organization_application_id: foundOrgApp.id,
          employee_id: emp.employee_id,
        },
        defaults: {
          organization_id: req.body.organizationId,
          organization_application_id: foundOrgApp.id,
          employee_id: emp.employee_id,
          employee_name: `${emp.FirstName} ${emp.LastName}`,
          email: emp.EmailID,
          mobile: `${emp["Mobile.country_code"]}${emp.Mobile} ` || null,
          role: emp.Role || null,
          employee_status: emp.Employeestatus,
          department_id: emp["Department.ID"] || null,
          reporting_to: emp.Reporting_To || null,
          data: null,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      });
      if (foundEmp) {
        await Employee.update(
          {
            employee_name: `${emp.FirstName} ${emp.LastName}`,
            email: emp.EmailID,
            mobile: `${emp["Mobile.country_code"]}${emp.Mobile}` || null,
            role: emp.Role || null,
            employee_status: emp.Employeestatus,
            department_id: emp["Department.ID"] || null,
            reporting_to: emp.Reporting_To || null,
            data: null,
            updated_at: Date.now(),
          },
          {
            where: {
              id: foundEmp.id,
            },
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(error.response.status).send({
      message:
        error?.response?.data?.message ||
        error?.response?.data?.response?.errors?.message,
    }); //zohopeople error object is different from zohobooks
  }
  //--------------------------------------------------//
  //--------------------------------------------------//
  //--------------------------------------------------//
  //create synclog if everything is ok
  try {
    await SyncLog.create({
      organization_id: req.body.organizationId,
      organization_application_id: foundOrgApp.id,
      sync_target: "hr",
      sync_type: "manual",
      data: JSON.stringify(ZPData),
      sync_status: "success",
      start_time: start_time,
      end_time: new Date(),
      created_at: new Date(),
      active: 1,
    });
  } catch (error) {
    console.log(error);
    //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
    if (error.errors) return res.status(500).send(error.errors[0].message);
    //sequilize error object has property name -> in case of foreign key constraint error
    else return res.status(500).send(error.name);
  }
  res.status(200).send({ ZPData, syncTime: new Date() });
};
//---------------------------------------------------------------//
//---------------------------------------------------------------//
//---------------------------------------------------------------//
exports.getData = async (req, res) => {
  res.status(200).send({ ZPData: [], syncTime: new Date() });
};
