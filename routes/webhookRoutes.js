const express = require('express');
const router = express.Router();
const { WebhookClient } = require('dialogflow-fulfillment');
const fundController = require('../controllers/fundController');
const chatBotController = require('../controllers/chatboatController');
const handleTransactionHistoryController = require('../controllers/transactionController');

const portfolioController = require('../controllers/portfolioController');
const newInvestmentController = require('../controllers/newInvestmentController');
const fallbackController = require('../controllers/fallbackController');
const contactNumberController = require('../controllers/contactNumberController');
const datePeriodController = require('../controllers/datePeriodController');

router.post('/', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  
  try {
    const intentMap = new Map();
    intentMap.set("Default Welcome Intent", chatBotController.welcome);
    intentMap.set("chatboatservice", chatBotController.chatboatservice);
    intentMap.set("Towards Transaction History Intent", handleTransactionHistoryController.handleTransactionHistory);
    intentMap.set("Get Contact Number Intent", contactNumberController.handleContactNumber);
    intentMap.set("Date Period Validation Intent", datePeriodController.handleDatePeriod);
    intentMap.set("Show Portfolio Intent", portfolioController.handlePortfolioValuation);
    intentMap.set("Explore Funds Intent", fundController.handleFunds);
    intentMap.set("Show Fund Option Intent", fundController.handleFundOptions);
    intentMap.set("Show Fund Name Chips Intent", fundController.handleFundNameChips);
    intentMap.set('New Invest Intent', newInvestmentController.handleNewInvestment);
    intentMap.set('Final Investment intent', newInvestmentController.handleFinalInvestment)
    intentMap.set(null, fallbackController.fallback);

    agent.handleRequest(intentMap);

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;