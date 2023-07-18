const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT } = require("../configs/app_config");
const { User, OrganizationApplication } = require("../models");
const { check, validationResult } = require("express-validator");
//--------------------------------------------------------------//
exports.validateUser = [
  check("email").isEmail().withMessage("Email is invalid"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("first_name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  check("last_name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  check("role")
    .isIn(["superadmin", "admin", "member"])
    .withMessage("Role must be one of: superadmin, admin, member"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
//--------------------------------------------------------------//
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const valid = bcrypt.compareSync(req.body.password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    //---------------------------------------------------------//
    //get all applications for single organization
    let applications = [];
    if (user.role !== "member") {
      try {
        applications = await OrganizationApplication.findAll({
          where: {
            organization_id: user.organization_id,
          },
        });
        if (applications.length > 0) {
          applications.map((application, index) => {
            applications[index] = {
              organization_id: application.organization_id,
              application_id: application.application_id,
              integration_status: application.integration_status,
            };
          });
        }
      } catch (error) {
        return res.status(500).send("Internal server error");
      }
    }
    const token = jwt.sign(
      {
        id: user.id,
        organizationId: user.organization_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        active: user.active,
        data: { ...JSON.parse(user.data), oktaClientSecret: null },
        applications: user.role !== "member" ? applications : [],
        // description: `1- if user is admin, then the applications array will contain the applications.
        //   2- if user is member, then applications array will be empty and user must be navigated to dashboard directly, because members can't choose applications only admins can.
        //   3- if admin, check status of each application, if any application is authenticated, so no more authentication needed, then display connected for this application in frontend and leave other applications with connect button
        //   4- if all applications are authenticated, then admins must be directed to dashboard`,
      },
      JWT.jwtsecretkey
    );
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};
//--------------------------------------------------------------//
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//--------------------------------------------------------------//
exports.createUser = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    let user = {
      ...req.body,
      password: bcrypt.hashSync(req.body.password, salt),
    };
    await User.create(user);
    delete user.password;
    return res.status(201).send(user);
  } catch (error) {
    //sequilize error object has errors array -> in case you miss to add "NOT NULL" column
    if (error.errors) return res.status(500).send(error.errors[0].message);
    //sequilize error object has property name -> in case of foreign key constraint error
    else return res.status(500).send(error.name);
  }
};
//--------------------------------------------------------------//
exports.getUser = async (req, res) => {
  try {
    let { token } = req.body;
    const decoded = jwt.verify(token, JWT.jwtsecretkey);
    if (!decoded) {
      return res.status(400).send({ message: "Wrong token provided" });
    }
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    //---------------------------------------------------------//
    //get all applications for single organization
    let applications = [];
    if (user.role !== "member") {
      try {
        applications = await OrganizationApplication.findAll({
          where: {
            organization_id: user.organization_id,
          },
        });
        if (applications.length > 0) {
          applications.map((application, index) => {
            applications[index] = {
              organization_id: application.organization_id,
              application_id: application.application_id,
              integration_status: application.integration_status,
            };
          });
        }
      } catch (error) {
        return res.status(500).send("Internal server error");
      }
    }
    token = jwt.sign(
      {
        organizationId: user.organization_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        active: user.active,
        data: { ...JSON.parse(user.data), oktaClientSecret: null },
        applications: user.role !== "member" ? applications : [],
      },
      JWT.jwtsecretkey
    );
    return res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};
//--------------------------------------------------------------//
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(req.body);
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//--------------------------------------------------------------//
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.update({ deleted_at: new Date() });
      res.json({ message: "User deleted" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
