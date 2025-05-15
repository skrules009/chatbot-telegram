const ContextService = require("../services/contextService");

const handleTransactionHistory = (agent) => {
  const userSession = ContextService.getUserSession(agent);
  if (!userSession?.contact) {
    agent.add("Please enter your registered contact number to proceed.");
  }
  if (!userSession.fundCategory) {
    userSession.selection = agent.query;
  } 
  agent.context.set({
    name: 'asking-contact',
    lifespan: 1,
    parameters: { 
      selection: agent.query
    }
  });
  console.log(agent.query, "handleTransactionHistory", "selection");
  ContextService.saveUserSession(agent, userSession);

};

module.exports = {
  handleTransactionHistory,
};
