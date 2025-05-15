const newInvestmentController = require("../controllers/newInvestmentController");
const validationService = require("../services/validationService");
const dataService = require("../services/dataService");
const { Payload } = require("dialogflow-fulfillment");
const ContextService = require("../services/contextService");

function handleContactNumber(agent) {
  const userSession = ContextService.getUserSession(agent);
  const { phone_number } = agent.parameters;

  // Check if we're in retry mode
  const retryContext = agent.context.get('awaiting_valid_phone');

  if (!retryContext && !validationService.validatePhoneNumber(phone_number)) {
    agent.context.set({
      name: 'awaiting_valid_phone',
      lifespan: 2,
      parameters: { retryCount: 1 }
    });
    agent.add("❌ Please enter a valid 10-digit mobile number.");
    return;
  }

  if (retryContext && !validationService.validatePhoneNumber(phone_number)) {
    const retryCount = retryContext.parameters.retryCount || 1;
    
    if (retryCount >= 3) {
      agent.add("⚠️ Maximum attempts reached. Transferring to human agent...");
      agent.context.delete('awaiting_valid_phone');
      return;
    }

    agent.context.set({
      name: 'awaiting_valid_phone',
      lifespan: 2,
      parameters: { retryCount: retryCount + 1 }
    });
    agent.add("Please enter exactly 10 digits:");
    return;
  }

  // Validation succeeded
  agent.context.delete('awaiting_valid_phone');
  ContextService.saveUserSession(agent, {
    ...userSession,
    contact: phone_number,
  });


  ContextService.saveUserSession(agent, {
    ...userSession,
    contact: phone_number,
  });
  console.log("-=======", userSession.selection);
  if (userSession.selection.toLowerCase() === "portfolio valuation") {
    handlePortfolioSelection(phone_number, agent);
  } else if (userSession.selection.toLowerCase() === "transaction history") {
    handleDateSelection(agent);
  } else if (userSession.selection.toLowerCase() === "explore funds") {
    newInvestmentController.handleNewInvestment(agent, phone_number);
  }
}

const handleDateSelection = (agent) => {
  const telegramPayload = {
    telegram: {
      text: "Kindly provide a time period.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Current Financial Year",
              callback_data: "Current Financial Year",
            },
          ],
          [
            {
              text: "Previous Financial Year",
              callback_data: "Previous Financial Year",
            },
          ],
        ],
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
};

const handlePortfolioSelection = (phone_number, agent) => {
  const transactionData = dataService.getJsonData("transactionData.json");
  const userData = transactionData?.find((x) => x.mobile === phone_number);

  if (!userData?.transactions?.length) {
    const telegramPayload = {
      telegram: {
        text: "❌ No portfolios found for your account. Would you like to explore funds?",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Explore Funds",
                callback_data: "Explore Funds",
              },
            ],
          ],
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
    return;
  }

  const portfolios = [
    ...new Set(userData.transactions.map((tx) => tx.fund_Id)),
  ];

  const portfolio = Array.from(portfolios).map((item) => [
    {
      text: item,
      callback_data: item,
    },
  ]);
  const telegramPayload = {
    telegram: {
      text: "Kindly select one of your portfolios:",
      reply_markup: {
        inline_keyboard: portfolio,
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
};

module.exports = { handleContactNumber };
