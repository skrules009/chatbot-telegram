const { Payload } = require("dialogflow-fulfillment");
const handleTransactionHistoryController = require("./transactionController");
const validationService = require("../services/validationService");
const dataService = require("../services/dataService");
const ContextService = require("../services/contextService");
const moment = require("moment");
const fs = require('fs');
const path = require('path');

const handleNewInvestment = (agent, phone_number) => {
  const userSession = ContextService.getUserSession(agent);
  

  const customCondition = phone_number ?? userSession.contact;
  agent.context.set({
    name: 'awaiting-contact',
    lifespan: 1,
    parameters: { 
      contact: customCondition
    }
  })

  console.log("--------", customCondition);
  if (!customCondition) {
    handleTransactionHistoryController.handleTransactionHistory(agent);
  } else {
    const Amount = ["1000", "2000", "3000", "5000", "10000"].map((item) => [
      {
        text: item,
        callback_data: item,
      },
    ]);

    const telegramPayload = {
      telegram: {
        text: "Enter amount in Rupees.",
        reply_markup: {
          inline_keyboard: Amount,
        },
        parse_mode: "Markdown",
      },
    };
    agent.add(
      new Payload(agent.TELEGRAM, telegramPayload, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }
  // Chips
};

const handleFinalInvestment = (agent) => {
  const  amount  = agent.query;
  const validation = validationService.validateAmount(amount);
  if (!validation.valid) {
    agent.add(validation.message);
    return handleNewInvestment(agent); // Show options again
  }
  const userSession = ContextService.getUserSession(agent);
   const context = agent.context.get('awaiting-contact');
  userSession.amount = amount;
  userSession.contact = context?.parameters?.contact;
  ContextService.saveUserSession(agent, userSession);
console.log("******", handleFinalInvestment);
  const currentDate = moment().format("YYYY-MM-DD");
    if (!userSession?.fundName) {
        agent.add("❌ Fund name not found in session. Please restart the process.");
        return;
    }

    if (!amount || !currentDate) {
      agent.add("❌ Transaction details are incomplete. Please try again.");
       return;
    }
    const newTransaction = {
      date: currentDate,
      amount: amount,
      fund_Id: "NEW-00"+dataService.getRandomIntInclusive(1, 10),
      fund_name: userSession.fundName
    };
    // If we want to make real entry then enable below line of code.
    //const IsSaved = dataService.addNewTransaction(newTransaction, context?.parameters?.contact);
    const message = `
    Date: ${currentDate}
    Amount: ${amount}INR
    Fund Name: ${userSession.fundName}

    Thank you for choosing our services. 
  `;

  const telegramPayload = {
    telegram: {
      text: message,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Do you want to invest more?",
              callback_data: "Yes"
            }
          ],
          [
            {
              text: "Return to Main menu",
              callback_data: "Return to Main menu"
            }
          ]
        ]
      },
      parse_mode: "Markdown"
    }
  };
  agent.add(new Payload(agent.TELEGRAM, telegramPayload, { sendAsMessage: true, rawPayload: true }));
};



module.exports = { handleNewInvestment, handleFinalInvestment };
