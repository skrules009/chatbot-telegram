const dataService = require("../services/dataService");
const { Payload } = require("dialogflow-fulfillment");
const ContextService = require("../services/contextService");

function handleFunds(agent) {
  const uniqueCategory = ["Equity", "Debt", "Hybrid"];
  const userSession = ContextService.getUserSession(agent);
  userSession.selection = agent.query.toLowerCase() === 'yes' ? userSession.selection : agent.query.toLowerCase();
  console.log(agent.query, "handleFunds", "selection");
  ContextService.saveUserSession(agent, userSession);

  const category = Array.from(uniqueCategory)?.map((item) => [
    {
      text: item.toLowerCase(),
      callback_data: item.toLowerCase(),
    },
  ]);

  const telegramPayload = {
    telegram: {
      text: "Kindly select one of categories to see funds:",
      reply_markup: {
        inline_keyboard: category,
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

const handleFundOptions = (agent) => {
  const category = agent.query?.toLowerCase();

  const categoryData = dataService
    .getJsonData("fundCategory.json")
    .find((x) => x.category.toLowerCase() === category);

  if (!categoryData) {
    agent.add("❌ No record found for the provided category.");
    return;
  }

  const fundCategory = categoryData.funds;
  const uniqueFunds = new Set(fundCategory?.map((x) => x.fund_name));

  const fundButtons = Array.from(uniqueFunds).map((item) => [
    {
      text: item,
      callback_data: item,
    },
  ]);

  if (!fundButtons.length) {
    agent.add("❌ No funds found in this category.");
    return;
  }

  const userSession = ContextService.getUserSession(agent);
  userSession.fundCategory = category;
  ContextService.saveUserSession(agent, userSession);


  const telegramPayload = {
    telegram: {
      text: "Select one of below fund:",
      reply_markup: {
        inline_keyboard: fundButtons,
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

const handleFundNameChips = (agent) => {
  const fundName = agent.query;
  console.log(agent.query, "handleFundNameChips", "fundName");

  const data = dataService.getFundDetails(fundName);
  const telegramPayload = {
    telegram: {
      text: data + `\n\nQuick suggestions:`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Invest",
              callback_data: "Invest",
            },
          ],
          [
            {
              text: "Return to Main menu",
              callback_data: "Return to Main menu",
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

  const userSession = ContextService.getUserSession(agent);
  ContextService.saveUserSession(agent, { ...userSession, fundName });
};

module.exports = {
  handleFunds,
  handleFundOptions,
  handleFundNameChips,
};
