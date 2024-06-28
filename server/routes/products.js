const express = require('express');
const router = express.Router();
const path = require('path');
const csvtojson = require('csvtojson');
require('dotenv').config();

// Load environment variables
const DATA_DIR = path.resolve(__dirname, '../scripts/data');

// Function to get the current date in the desired format
function getCurrentDate() {
  const current_time = new Date();
  return `${current_time.getFullYear()}${String(current_time.getMonth() + 1).padStart(2, '0')}${String(current_time.getDate()).padStart(2, '0')}`;
}

// Endpoint to fetch BestBuy comparison data
router.get('/compare/dell-bestbuy', async (req, res) => {
  const date = getCurrentDate();
  const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);

  try {
    const bestbuyData = await csvtojson().fromFile(bestbuyFilePath);
    if (!Array.isArray(bestbuyData)) {
      throw new Error('Expected array from bestbuyData');
    }
    res.json(bestbuyData);
  } catch (error) {
    console.error(`Error fetching BestBuy data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching BestBuy data', error });
  }
});

// Endpoint to fetch Newegg comparison data
router.get('/compare/dell-newegg', async (req, res) => {
  const date = getCurrentDate();
  const neweggFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

  try {
    const neweggData = await csvtojson().fromFile(neweggFilePath);
    if (!Array.isArray(neweggData)) {
      throw new Error('Expected array from neweggData');
    }
    res.json(neweggData);
  } catch (error) {
    console.error(`Error fetching Newegg data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching Newegg data', error });
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
      csvtojson().fromFile(dellFilePath),
      csvtojson().fromFile(bestbuyFilePath),
      csvtojson().fromFile(neweggFilePath)
    ]);

    if (!Array.isArray(dellData)) {
      throw new Error('Expected array from dellData');
    }
    if (!Array.isArray(bestbuyData)) {
      throw new Error('Expected array from bestbuyData');
    }
    if (!Array.isArray(neweggData)) {
      throw new Error('Expected array from neweggData');
    }

    res.json({ dellData, bestbuyData, neweggData });
  } catch (error) {
    console.error(`Error fetching all products data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching all products data', error });
  }
});

module.exports = router;