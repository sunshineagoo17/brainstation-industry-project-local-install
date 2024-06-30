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

// Endpoint to fetch dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const mostRecentBestBuyFile = getMostRecentFile('bestbuy_comparison');
    const mostRecentNeweggFile = getMostRecentFile('newegg_comparison');

    if (!mostRecentBestBuyFile || !mostRecentNeweggFile) {
      throw new Error("No recent data files found.");
    }

    const bestbuyFilePath = path.join(DATA_DIR, mostRecentBestBuyFile);
    const neweggFilePath = path.join(DATA_DIR, mostRecentNeweggFile);

    const [bestbuyData, neweggData] = await Promise.all([
      csvtojson().fromFile(bestbuyFilePath),
      csvtojson().fromFile(neweggFilePath)
    ]);

    const totalOffenders = 2; // Assuming monitoring BestBuy and Newegg
    const bestbuyTop5 = bestbuyData.filter(item => item.Status !== 'Green').sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);
    const neweggTop5 = neweggData.filter(item => item.Status !== 'Green').sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);
    const totalDeviatedProductsBestBuy = bestbuyData.filter(item => item.Deviation !== 0).length;
    const totalDeviatedProductsNewegg = neweggData.filter(item => item.Deviation !== 0).length;
    const averageDeviationBestBuy = bestbuyData.reduce((sum, item) => sum + parseFloat(item.Deviation || 0), 0) / bestbuyData.length;
    const averageDeviationNewegg = neweggData.reduce((sum, item) => sum + parseFloat(item.Deviation || 0), 0) / neweggData.length;
    const complianceRateBestBuy = (bestbuyData.filter(item => item.Status === 'Green').length / bestbuyData.length) * 100;
    const complianceRateNewegg = (neweggData.filter(item => item.Status === 'Green').length / neweggData.length) * 100;

    const dashboardData = {
      totalOffenders,
      bestbuyTop5,
      neweggTop5,
      totalDeviatedProductsBestBuy,
      totalDeviatedProductsNewegg,
      averageDeviationBestBuy,
      averageDeviationNewegg,
      complianceRateBestBuy,
      complianceRateNewegg
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(`Error fetching dashboard data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
});

module.exports = router;