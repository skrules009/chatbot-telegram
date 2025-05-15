const { Payload } = require("dialogflow-fulfillment");

const fallback = (agent) => {
  const telegramPayload = {
    telegram: {
      text: "I didn't understand that. Can you try again?",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Portfolio Valuation",
              callback_data: "Portfolio Valuation",
            },
          ],
          [
            {
              text: "Explore Funds",
              callback_data: "Explore Funds",
            },
          ],
          [
            {
              text: "Transaction History",
              callback_data: "Transaction History",
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
  console.warn(`No handler for intent: ${agent.intent}`);
};

module.exports = { fallback };
