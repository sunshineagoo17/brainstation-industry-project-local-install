const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const csvtojson = require('csvtojson');
require('dotenv').config();

// Load environment variables
const DATA_DIR = path.resolve(__dirname, '../scripts/data');

// Function to get the most recent file matching a pattern
function getMostRecentFile(pattern) {
  const files = fs.readdirSync(DATA_DIR).filter(file => file.includes(pattern));
  if (files.length === 0) {
    return null;
  }
  files.sort((a, b) => fs.statSync(path.join(DATA_DIR, b)).mtime - fs.statSync(path.join(DATA_DIR, a)).mtime);
  return files[0];
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
  try {
    const mostRecentDellFile = getMostRecentFile('official_dell_monitor');
    if (!mostRecentDellFile) {
      throw new Error("No recent Dell data file found.");
    }
    const dellFilePath = path.join(DATA_DIR, mostRecentDellFile);
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
  try {
    const mostRecentBestBuyFile = getMostRecentFile('bestbuy_comparison');
    if (!mostRecentBestBuyFile) {
      throw new Error("No recent BestBuy data file found.");
    }
    const bestbuyFilePath = path.join(DATA_DIR, mostRecentBestBuyFile);
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
  try {
    const mostRecentNeweggFile = getMostRecentFile('newegg_comparison');
    if (!mostRecentNeweggFile) {
      throw new Error("No recent Newegg data file found.");
    }
    const neweggFilePath = path.join(DATA_DIR, mostRecentNeweggFile);
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
  try {
    const mostRecentDellFile = getMostRecentFile('official_dell_monitor');
    const mostRecentBestBuyFile = getMostRecentFile('bestbuy_comparison');
    const mostRecentNeweggFile = getMostRecentFile('newegg_comparison');

    if (!mostRecentDellFile || !mostRecentBestBuyFile || !mostRecentNeweggFile) {
      throw new Error("No recent data files found for one or more sources.");
    }

    const dellFilePath = path.join(DATA_DIR, mostRecentDellFile);
    const bestbuyFilePath = path.join(DATA_DIR, mostRecentBestBuyFile);
    const neweggFilePath = path.join(DATA_DIR, mostRecentNeweggFile);

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