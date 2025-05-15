class UserSession {
  constructor(contact, selection, fundName, fundCategory, amount, context = {}) {
    this.contact = contact;
    this.selection = selection;
    this.context = context;
    this.fundName = fundName;
    this.fundCategory = fundCategory;
    this.amount = amount;
  }
}

module.exports = UserSession;