const moment = require("moment");
const { Payload } = require("dialogflow-fulfillment");
const dataService = require("../services/dataService");
const ContextService = require("../services/contextService");

const DATE_FORMATS = [
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "MM-DD-YYYY",
    "Do MMM YYYY",
    "Do MMM",
    "D MMM",
    "DDMMM",
    "MMM D",
    "MMM Do"
];

const handleDatePeriod = (agent) => {
   const userInput = agent.query.toLowerCase();
    console.log("User input:", userInput, "handleDatePeriod");

    const today = moment();
    const currentYear = today.year();
    let startDate, endDate;

    // Financial Year Configuration
    const getFYRange = (yearOffset = 0) => ({
        start: moment(`${currentYear + yearOffset}-04-01`),
        end: moment(`${currentYear + yearOffset + 1}-03-31`)
    });

    if (userInput === "current financial year" || userInput === "current year" || userInput === "this year") {
        ({ start: startDate, end: endDate } = getFYRange());
    } else if (userInput === "previous financial year" || userInput === "last financial year" || userInput === "last year") {
        ({ start: startDate, end: endDate } = getFYRange(-1));
    } else {
        // Handle manual date input
        const parseDate = (dateStr) => {
            const date = moment(dateStr, DATE_FORMATS, true);
            if (!date.isValid()) return null;

            // Handle dates without year
            if (!dateStr.match(/\d{4}/)) {
                const currentFY = getFYRange();
                const isFutureMarch = date.month() === 2 && today.isAfter(currentFY.start);

                if (date.isBetween(currentFY.start, currentFY.end, undefined, '[]')) {
                    return date.year(currentYear);
                } else {
                    // Handle March in next FY context
                    return isFutureMarch ? 
                        date.year(currentYear + 1) : 
                        date.year(currentYear - (date.month() < 3 ? 1 : 0));
                }
            }
            return date;
        };

        // Split input into date range
        const [startStr, endStr] = userInput.split(/(?: to | - )/i);
        startDate = parseDate(startStr);
        endDate = parseDate(endStr);

        // Validation
        if (!startDate || !endDate) {
            agent.add("❌ Please provide a valid date range format. Examples:\n"
                + "• 25th May to 30th March\n"
                + "• 01apr-31mar\n"
                + "• 2025-04-01 to 2026-03-31");
            return;
        }

        // Ensure chronological order
        if (startDate.isAfter(endDate)) {
            [startDate, endDate] = [endDate, startDate];
        }

        // Verify financial year boundaries
        const minDate = moment().subtract(5, 'years');
        const maxDate = moment().add(5, 'years');
        
        if (startDate.isBefore(minDate)) {
            agent.add("❌ Start date cannot be older than 5 years");
            return;
        }

        if (endDate.isAfter(maxDate)) {
            agent.add("❌ End date cannot be more than 5 years in future");
            return;
        }
    }

  const userSession = ContextService.getUserSession(agent);
  const contact = userSession?.contact;

  return showTransactionHistory(startDate, endDate, contact, agent);
};

const showTransactionHistory = (startDate, endDate, contact, agent) => {
  const userData = dataService
    .getJsonData("transactionData.json")
    .find((entry) => entry.mobile === contact);

  if (!userData || !userData.transactions.length) {
    agent.add("No transactions found for the provided mobile number.");
    return;
  }

  const filtered = userData.transactions.filter((tx) => {
    const txDate = moment(tx.date, "YYYY-MM-DD");
    return txDate.isBetween(startDate, endDate, undefined, "[]");
  });

  if (!filtered.length) {
    agent.add(
      `No transactions found between ${startDate.format(
        "YYYY-MM-DD"
      )} and ${endDate.format("YYYY-MM-DD")}.`
    );
    return;
  }

  const lastTransactions = filtered.slice(-3);
  const tableText = lastTransactions
    .map((tx) => `${tx.date} | ${tx.fund_name} | ${tx.amount}`)
    .join("\n");

const responseMessage = `
✅ Date range selected:
From ${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}

Last 3 Transactions

Date             | Portfolio                 | Amount
-----------------|----------------------------|----------
${tableText}
        \n`;
const telegramPayload = {
    telegram: {
      text: responseMessage,
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

module.exports = { handleDatePeriod };
