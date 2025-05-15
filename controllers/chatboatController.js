
const { Payload } = require("dialogflow-fulfillment");
const ContextService = require("../services/contextService");

const chatboatservice = (agent) => {
  // This will clear the context so that i can do the demo with other contact number as well.
  ContextService.clearAllContext(agent);
  
  const telegramPayload = {
    telegram: {
      text: "Hi, welcome to ABC Mutual Fund Services. What service would you like to use?",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Portfolio Valuation",
              callback_data: "Portfolio Valuation"
            }
          ],
          [
            {
              text: "Explore Funds",
              callback_data: "Explore Funds"
            }
          ],
          [
            {
              text: "Transaction History",
              callback_data: "Transaction History"
            }
          ]
        ]
      },
      parse_mode: "Markdown"
    }
  };
  agent.add(new Payload(agent.TELEGRAM, telegramPayload, { sendAsMessage: true, rawPayload: true }));
};

function welcome() {
  agent.add(
    "Hi, welcome to ABC Mutual Fund Services. What service would you like to use? Quick"
  );
}
module.exports = {
  chatboatservice,
  welcome,
};
