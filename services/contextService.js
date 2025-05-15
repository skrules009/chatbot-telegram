const UserSession = require('../models/UserSession');

class ContextService {
  static createUserSession(agent, params = {}) {
    const sessionId = agent.session.split('/').pop();
    
    return new UserSession(
      params.contact || null,
      params.selection || null,
      params.fundName || null,
      params.fundCategory || null,
      params.amount || null,
      
      {
        ...params.context,
        sessionId,
        timestamp: new Date().toISOString()
      }
    );
  }

  static getUserSession(agent) {
    
    const dialogflowContext = agent.context.get('user_session');
    if (!dialogflowContext) {
      return this.createUserSession(agent);
    }

    const response = new UserSession(
      dialogflowContext.parameters.contact,
      dialogflowContext.parameters.selection,
      dialogflowContext.parameters.fundName,
      dialogflowContext.parameters.fundCategory,
      dialogflowContext.parameters.amount,
      dialogflowContext.parameters.context,
     
    );
    return response;
  }

  static saveUserSession(agent, userSession) {
    agent.context.set({
      name: 'user_session',
      lifespan: 12,
      parameters: {
        contact: userSession.contact,
        selection: userSession.selection,
        fundName: userSession.fundName,
        amount: userSession.amount,
        fundCategory: userSession.fundCategory,
        context: userSession.context
      }
    });
    console.log('saveUserSession', userSession)
  }

  static clearAllContext(agent){
    agent.context.set({
      name: 'user_session',
      lifespan: 0,
      parameters: {
        contact: null,
        selection: null,
        fundName: null,
        amount: null,
        fundCategory: null,
        context: null
      }
    });
  }
}

module.exports = ContextService;