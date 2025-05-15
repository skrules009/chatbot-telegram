const { Payload } = require("dialogflow-fulfillment");

const payload = (agent, inline_keyboard, text) => {
  const telegramPayload = {
    telegram: {
      text: text,
      reply_markup: {
        inline_keyboard: inline_keyboard,
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

module.exports = { payload };
