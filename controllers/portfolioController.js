const dataService = require('../services/dataService');
const ContextService = require('../services/contextService');
const { Payload } = require("dialogflow-fulfillment");
const moment = require("moment");

const handlePortfolioValuation = (agent) => {
      const portfolio_number = agent.query.toLowerCase();
        console.log(agent.query, 'handlePortfolioValuation', 'portfolio_number')
      if(!portfolio_number) {
         ValidateFields(agent,`Please provide the profile number again`);
        return;
      }
      const userSession = ContextService.getUserSession(agent);
      const contact = userSession.contact;
      if(!contact) {
        ValidateFields(agent, "It seems that contact number has been missed, Please go back");
        return;
      }
      const transactions = dataService.getJsonData("transactionData.json");
      const filteredData = transactions.find(
        (x) => x.mobile === contact
      ).transactions;

      if (!filteredData) {
         ValidateFields(agent,`❌ No record found for the provided portfolio number.\nWould you like to invest?`);
        return;
        // Map here Step 2
      }

      const filteredPortfolio = filteredData.filter(
        (x) => x.fund_Id.toLowerCase() === portfolio_number
      );
      const currentDate = moment().format('YYYY-MM-DD');
      // let tableText = `Portfolio No | Amount  | current_date\n`;
      // tableText += `------------------|------------|---------------\n`;
      //let total = 0;

      const valuation = filteredPortfolio.reduce((acc, { fund_Id, amount }) => {
        acc[fund_Id] = (acc[fund_Id] || 0) + amount;
        return acc;
      }, {});

      let response = '';
      console.log(valuation);
      Object.entries(valuation).forEach(([key, total]) => {
        response +=`Your Portfolio ${key} valuation is ${total}INR on ${currentDate}`;
      });
      response+=`\n\nTotal amount invested ${filteredData?.reduce((sum, tx) => sum + tx.amount, 0)}INR\n\n`;

      // filteredPortfolio.forEach((fn) => {
      //   tableText += ` ${fn.fund_Id}    |  ${fn.amount}    | ${currentDate}\n`;
      //   total += fn.amount;
      // });
      // tableText += `\n\nTotal amount invested ${total}\n\n
      // Thank you for using our services`;
      const telegramPayload = {
      telegram: {
        text: response,
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
      }


    const ValidateFields = (agent, text) =>{
      const telegramPayload = {
          telegram: {
            text: text,
            reply_markup: {
              inline_keyboard: [
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
    }

    module.exports = {handlePortfolioValuation}