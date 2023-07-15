// "office 2016" : "Ms office"  --> "office" -> "MS OFFICE"

const vendorsCategorizeMapping = new Map([
  ["Hicks", { name: "G Suite", catId: 1 }],
  ["Squeaky", { name: "Office", catId: 2 }],
  ["Office", { name: "Office", catId: 2 }],
  ["Bob", { name: "Jira", catId: 3 }],
  ["Tania", { name: "Hubspot", catId: 1 }],
  ["Chin", { name: "Atlassian", catId: 2 }],
  ["Pam", { name: "Slack", catId: 3 }],
  ["Bessie", { name: "Figma", catId: 1 }],
  ["Robertson", { name: "Skype", catId: 2 }],
  ["Tony", { name: "Asana", catId: 3 }],
  ["Lee", { name: "Zoom", catId: 1 }],
  //   "Mahoney", "Ellis" // not defined in mappings
]);

const vendorsCategorize = (name) => {
  let mapValue = null;
  vendorsCategorizeMapping.forEach((value, keyword) => {
    if (name.search(new RegExp(keyword, "i")) !== -1) mapValue = value;
  });
  if (mapValue === null) return { name, catId: 0 };
  else return mapValue;
};

module.exports = { vendorsCategorize };
