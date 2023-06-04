const { Organization } = require("../models");
const { check, validationResult } = require("express-validator");

async function hashedIdExists(hashed_id) {
    const organization = await OrganizationModel.findOne({
      where: { hashed_id: hashed_id },
    });
    return organization !== null;
}

async function generateUniqueHashedId() {
    let hashed_id = Math.floor(1000000000 + Math.random() * 9000000000);
    while (await hashedIdExists(hashed_id)) {
      hashed_id = Math.floor(1000000000 + Math.random() * 9000000000);
    }
    return hashed_id;
}
 
exports.organizationValidationRules = [
    check("name").not().isEmpty().withMessage("Organization name is required"),
    check("address").optional().not().isEmpty().withMessage("Address is required"),
    check("phone").optional().not().isEmpty().withMessage("Phone is required"),
    check("contact_person").optional().not().isEmpty().withMessage("Contact person is required"),
    check("logo_url").optional().not().isEmpty().withMessage("Logo URL is required"),
    check("onboarding_status").optional().isIn(["not_started", "in_progress", "completed"]).withMessage("Invalid onboarding status value"),
    check("active").optional().isBoolean().withMessage("Active must be a boolean value")
  ];

exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    if (organization) {
      res.status(200).json(organization);
    } else {
      res.status(404).json({ error: "Organization not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrganization = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const organizationData = {
        ...req.body,
        hashed_id: generateUniqueHashedId(),
      };
      const organization = await Organization.create(organizationData);
      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
exports.updateOrganization = async (req, res) => {
  try {
    const updated = await Organization.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated[0] === 1) {
      res.status(200).json({ message: "Organization updated successfully" });
    } else {
      res.status(404).json({ error: "Organization not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrganization = async (req, res) => {
    try {
      const { id } = req.params;
  
      const organization = await Organization.findByPk(id);
  
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
  
      await Organization.update({ deleted_at: new Date() }, { where: { id } });
  
      res.status(200).json({ message: "Organization successfully deleted" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting the organization", error: error.message });
    }
  };
