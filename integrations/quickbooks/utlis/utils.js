const config = require("../config/config");
const intuitOAuth = require("intuit-oauth");
const {
  OrganizationApplication,
  Subscription,
  Employee,
} = require("../../../models");
//-------------------------------------------------//
const currentMonth = new Date().getMonth();
const monthNames = new Map([
  [0, "Jan"],
  [1, "Feb"],
  [2, "Mar"],
  [3, "Apr"],
  [4, "May"],
  [5, "Jun"],
  [6, "Jul"],
  [7, "Aug"],
  [8, "Sep"],
  [9, "Oct"],
  [10, "Nov"],
  [11, "Dec"],
]);
//-------------------------------------------------//
const defaultAppData = () => {
  return {
    statsCards: [
      {
        title: "Renewals",
        value: 0,
        valueType: "stats",
        subValues: [
          {
            subValue: 0,
            subValueState: "negative",
            subTitle: "Pending",
          },
          {
            subValue: 0,
            subValueState: "normal",
            subTitle: "Upcoming",
          },
          {
            subValue: 0,
            subValueState: "positive",
            subTitle: "Renewed",
          },
        ],
      },
      {
        title: "Total apps",
        value: 0,
        valueType: "stats",
        subValues: [
          {
            subValue: 0,
            subValueState: "positive",
            subTitle: "Free",
          },
          {
            subValue: 0,
            subValueState: "positive",
            subTitle: "Paid",
          },
        ],
      },
      {
        title: "Total Saas Spent",
        value: 0, // "$2k"
        valueType: "value",
        subValues: [
          {
            subValue: 0, // "10"
            subValueState: "positive",
            subTitle: "Total User",
          },
          {
            subValue: 0, // "$200"
            subValueState: "positive",
            subTitle: "Per user spend",
          },
        ],
      },
    ],
    chartsData: [
      {
        title: "Spend Summary by department",
        subTitle: "Total Spend",
        value: 0, // 2478
        subValues: new Array(3).fill({
          subValue: 0, // "$78"
          subTitle: "HR", // "HR"
        }),
        chartType: "line",
        chartSeries: [
          {
            name: "Human R.", // name: "Finance"
            data: [250, 250, 250, 250, 250, 250, 250, 250, 250], // [260, 360, 320, 560, 750, 660, 510, 200, 250]
          },
          {
            name: "Marketing", // name: "Finance"
            data: [250, 250, 250, 250, 250, 250, 250, 250, 250], // [260, 360, 320, 560, 750, 660, 510, 200, 250]
          },
          {
            name: "Finance", // name: "Finance"
            data: [250, 250, 250, 250, 250, 250, 250, 250, 250], // [260, 360, 320, 560, 750, 660, 510, 200, 250]
          },
        ],
        xData: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"], // ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
      },
      {
        title: "Top 4 Apps by Spend",
        subTitle: "Total Spend",
        value: 0, // 4249
        subValues: new Array(4).fill({
          subValue: 0, // "$1200"
          subTitle: "", // "G Suite"
        }),
        chartType: "pie",
        chartSeries: [10, 10, 10, 10], // [30, 25, 25, 10]
        xData: ["Atlassian", "G Suite", "Hubspot", "Office", ""],
      },
      {
        title: "License Summary",
        subTitle: "Total Wasted Value",
        value: 0, // 2478
        subValues: [
          {
            subValue: 0,
            subTitle: "Total Licenses",
          },
          {
            subValue: 0,
            subTitle: "Used Licenses",
          },
          {
            subValue: 0,
            subTitle: "Unused Licenses",
          },
          {
            subValue: "$0", // "$1200"
            subTitle: "G Suite", // "G Suite"
          },
        ],
        chartType: "bar",
        chartSeries: [
          {
            name: "Data 1",
            data: [100, 100, 100, 100, 100, 100], // [1100, 700, 550, 1300, 520, 850]
          },
          {
            name: "Data 2",
            data: [100, 100, 100, 100, 100, 100], // [120, 300, 520, 90, 350, 450]
          },
        ],
        xData: ["Marketing", "Finance", "HR", "IT", "Engineering", "R&D"], // ["Marketing", "Finance", "HR", "IT", "Engineering", "R&D"]
      },
    ],
  };
};
//-------------------------------------------------//
const formQBClient = (data = null) => {
  if (data) {
    return new intuitOAuth({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      environment: config.environment,
      redirectUri: config.redirectUri,
      token: {
        refresh_token: data.refreshToken,
        x_refresh_token_expires_in: data.refreshTokenExpiresIn,
      },
    });
  } else {
    return new intuitOAuth({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      environment: config.environment,
      redirectUri: config.redirectUri,
    });
  }
};
//-------------------------------------------------//
const prepareData = async (organizationId) => {
  let orgApps, subscriptions, employees;
  try {
    orgApps = await OrganizationApplication.findAll({
      where: { organization_id: organizationId, deleted_at: null },
    });
    subscriptions = await Subscription.findAll({
      where: { organization_id: organizationId, deleted_at: null },
    });
    employees = await Employee.findAll({
      where: { organization_id: organizationId, deleted_at: null },
    });
  } catch (error) {
    console.log("error getting data from DB");
    return Array.from({ length: 5 }).fill(defaultAppData());
  }
  //- Constants ----------------------------------------------------//
  const today = new Date(); // Current Date in Milliseconds
  const monthInMs = 2629800000; // One Month to Milliseconds
  const periods = [1, 3, 6, 12, 60];
  //--> "Last Month", "Last 3 Months", "Last 6 Months", "Last Year", "Last 5 Years"

  //- Define appData for all periods -------------------------------//
  let appData = [];
  //- Filter subscriptions of vendors only ------------------------------//
  //TODO Requires correct data sample from QuickBooks
  //- Create appData for all periods -------------------------------//
  periods.map((period, periodIndex) => {
    //- Filter subscriptions by period ----------------------------------//
    let subscriptionListByPeriod = subscriptions.filter(
      (subscription) =>
        Date.parse(subscription.dataValues.renewal_start_date) >=
        Date.parse(today) - monthInMs * period
    );
    //- Sort by Larger TotalAmt ------------------------------------//
    subscriptionListByPeriod.sort(
      (a, b) =>
        b.dataValues.total_contract_value - a.dataValues.total_contract_value
    );
    //- Loop over filtered & sorted array of subscriptions by period ----//
    let temp = defaultAppData();
    subscriptionListByPeriod.map((subscription, i) => {
      //- Get Spend By Dept. For Last Year -----------------------------//
      if (periodIndex === 3) {
        const subscriptionMonth = Date(
          subscription.dataValues.renewal_start_date
        ).getMonth();
        const subscriptionCategory = subscription.dataValues.vendor_category;
      }
      if (i <= 3) {
        // Filter for total4AppsBySpend
        temp.chartsData[1].value =
          parseInt(subscription.dataValues.total_contract_value) +
          parseInt(temp.chartsData[1].value);
        temp.chartsData[1].subValues[i] = {
          // Top 4 Apps By Spend
          subTitle: subscription.dataValues.vendor_name,
          subValue: subscription.dataValues.total_contract_value,
        };
      }
      temp.chartsData[1].subValues.map((app) => {
        if (app.name === subscription.dataValues.vendor_name)
          app.subValue += subscription.dataValues.total_contract_value;
      });
      temp.statsCards[2].value =
        parseInt(subscription.dataValues.total_contract_value) +
        parseInt(temp.statsCards[2].value); // Total Saas Spent
      // Final Round Calculations for charts
      if (i === subscriptionListByPeriod.length - 1) {
        let maxAppsBySpend =
          subscriptionListByPeriod.length >= 4
            ? 4
            : subscriptionListByPeriod.length;
        for (j = 0; j < maxAppsBySpend; j++) {
          temp.chartsData[1].xData[j] =
            subscriptionListByPeriod[j].dataValues.vendor_name;
          temp.chartsData[1].chartSeries[j] = Math.round(
            (temp.chartsData[1].subValues[j].subValue /
              temp.chartsData[1].value) *
              100
          );
        }
      }
      //- Total Users in StatsCard 3
      temp.statsCards[2].subValues[0].subValue =
        subscriptionListByPeriod.length;
      //- Per User Spend in StatsCard 3
      temp.statsCards[2].subValues[1].subValue = Math.round(
        temp.statsCards[2].value / subscriptionListByPeriod.length
      );
    });
    temp.statsCards[1].value = orgApps.length;
    temp.statsCards[2].subValues[0].subValue = employees.length;
    temp.statsCards[2].subValues[1].subValue =
      temp.statsCards[2].value / employees.length;
    appData.push(temp);
  });
  return { appData, syncTime: new Date() };
};
//------------------------------------------------//
module.exports = {
  formQBClient,
  prepareData,
};
