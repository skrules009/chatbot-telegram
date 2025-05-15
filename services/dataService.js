const fs = require('fs');
const path = require('path');

const getJsonData = (fileName) => {
  try {
    const filePath = path.join(__dirname, '../data', fileName);
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
};

const getFundDetails = (fundName) => {
   const details = {
    "Alpha Growth Fund": "30% Debt - 30% Large Cap Equity - 20% Mid Cap - 20% Small Cap with 15% CAGR",
    "Beta Income Fund": "80% Debt - 20% Equity with 8% CAGR",
    "Gamma Balanced Fund": "50% Debt - 50% Equity with 12% CAGR",
    "Delta Tax Saver Fund": "100% Equity with tax benefits under Section 80C",
    "Omega Liquid Fund": "100% Debt with daily liquidity"
  };
  return details[fundName] || "Details not available";
};



const addNewTransaction = (newTransaction, contact) => {
  try {
    const filePath = path.join(__dirname, '../data', 'transactionData.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    const transactions = data.find(u => u.mobile === contact)?.transactions;
    transactions.push(newTransaction);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('✅ Transaction added successfully');
    return true;
  
  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    return false;
  }
};

const getRandomIntInclusive = (min, max)=> {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getJsonData,
  getFundDetails,
  addNewTransaction,
  getRandomIntInclusive
};