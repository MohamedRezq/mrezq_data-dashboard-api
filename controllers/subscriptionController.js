const { Subscription } = require("../models");
const { check, validationResult } = require("express-validator");

exports.SubscriptionValidation = [
    check('organization_id')
      .notEmpty()
      .withMessage('Organization ID is required')
      .isInt()
      .withMessage('Organization ID must be an integer'),
    check('organization_application_id')
      .notEmpty()
      .withMessage('Organization Application ID is required')
      .isInt()
      .withMessage('Organization Application ID must be an integer'),
  ];

exports.createSubscription = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = await Subscription.create(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  try {
    const [updated] = await Subscription.update(req.body, {
      where: { id: id },
    });

    if (!updated) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updatedSubscription = await Subscription.findByPk(id);
    res.status(200).json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Subscription.destroy({
      where: { id: id },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(204).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
