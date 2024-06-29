const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const csvtojson = require('csvtojson');
require('dotenv').config();

// Load environment variables
const DATA_DIR = path.resolve(__dirname, '../scripts/data');

// Function to get the current date in the desired format
function getCurrentDate() {
  const current_time = new Date();
  return `${current_time.getFullYear()}${String(current_time.getMonth() + 1).padStart(2, '0')}${String(current_time.getDate()).padStart(2, '0')}`;
}

// Utility function to fetch data from a CSV file
const fetchDataFromFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return await csvtojson().fromFile(filePath);
};

// Endpoint to fetch Dell data
router.get('/dell', async (req, res) => {
  const date = getCurrentDate();
  const dellFilePath = path.join(DATA_DIR, `official_dell_monitor_${date}.csv`);

  try {
    const dellData = await fetchDataFromFile(dellFilePath);
    console.log('Fetched Dell Data:', dellData);
    res.json(Array.isArray(dellData) ? dellData : []);
  } catch (error) {
    console.error(`Error fetching Dell data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching Dell data', error: error.message });
  }
});

// Endpoint to fetch BestBuy comparison data
router.get('/compare/dell-bestbuy', async (req, res) => {
  const date = getCurrentDate();
  const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);

  try {
    const bestbuyData = await fetchDataFromFile(bestbuyFilePath);
    console.log('Fetched BestBuy Data:', bestbuyData);
    res.json(Array.isArray(bestbuyData) ? bestbuyData : []);
  } catch (error) {
    console.error(`Error fetching BestBuy data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching BestBuy data', error: error.message });
  }
});

// Endpoint to fetch Newegg comparison data
router.get('/compare/dell-newegg', async (req, res) => {
  const date = getCurrentDate();
  const neweggFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

  try {
    const neweggData = await fetchDataFromFile(neweggFilePath);
    console.log('Fetched Newegg Data:', neweggData);
    res.json(Array.isArray(neweggData) ? neweggData : []);
  } catch (error) {
    console.error(`Error fetching Newegg data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching Newegg data', error: error.message });
  }
});

// Endpoint to fetch all products data
router.get('/', async (req, res) => {
  const date = getCurrentDate();
  const dellFilePath = path.join(DATA_DIR, `official_dell_monitor_${date}.csv`);
  const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);
  const neweggFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

  try {
    const [dellData, bestbuyData, neweggData] = await Promise.all([
      fetchDataFromFile(dellFilePath),
      fetchDataFromFile(bestbuyFilePath),
      fetchDataFromFile(neweggFilePath)
    ]);

    console.log('Fetched Dell Data:', dellData);
    console.log('Fetched BestBuy Data:', bestbuyData);
    console.log('Fetched Newegg Data:', neweggData);

    res.json({
      dellData: Array.isArray(dellData) ? dellData : [],
      bestbuyData: Array.isArray(bestbuyData) ? bestbuyData : [],
      neweggData: Array.isArray(neweggData) ? neweggData : []
    });
  } catch (error) {
    console.error(`Error fetching all products data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching all products data', error: error.message });
  }
});

module.exports = router;