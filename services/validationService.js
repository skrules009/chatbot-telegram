const moment = require('moment');

const validatePhoneNumber = (phone) => {
  return phone && /^\d{10}$/.test(phone);
};

const validateDateRange = (startDate, endDate) => {
  if (!startDate.isValid() || !endDate.isValid()) {
    return { valid: false, message: "❌ Invalid date format. Please use YYYY-MM-DD." };
  }
  
  if (startDate.isAfter(endDate)) {
    return { valid: false, message: "❌ Start date must be before end date." };
  }
  
  if (endDate.isAfter(moment())) {
    return { valid: false, message: "❌ End date cannot be in the future." };
  }
  
  return { valid: true };
};


const validateAmount = (amount) => {
  if (isNaN(amount)) {
    return { valid: false, message: '❌ Please enter a valid amount.' };
  }
  
  const numericAmount = Number(amount);
  
  if (numericAmount <= 0) {
    return { valid: false, message: '❌ Amount must be positive.' };
  }
  
  if (numericAmount > 50000) {
    return { valid: false, message: '❌ Maximum investment is ₹50,000.' };
  }
  
  return { valid: true };
};


module.exports = {
  validatePhoneNumber,
  validateDateRange,
  validateAmount
};