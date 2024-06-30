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

// Endpoint to fetch retailer data
router.get('/', async (req, res) => {
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

    const calculateMetrics = (data) => {
      const totalProducts = data.length;
      const complianceRate = (data.filter(item => item.Status === 'Green').length / totalProducts) * 100;
      const averageDeviation = data.reduce((sum, item) => sum + parseFloat(item.Deviation || 0), 0) / totalProducts;
      const topOffendingProducts = data.filter(item => item.Status !== 'Green').sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);
      const totalDeviatedProducts = data.filter(item => item.Status !== 'Green').length;

      return {
        totalProducts,
        complianceRate: complianceRate.toFixed(2),
        averageDeviation: averageDeviation.toFixed(2),
        topOffendingProducts,
        totalDeviatedProducts,
        allProducts: data
      };
    };

    const retailerData = {
      totalOffenders: bestbuyData.concat(neweggData).filter(item => item.Status !== 'Green').length,
      bestbuy: calculateMetrics(bestbuyData),
      newegg: calculateMetrics(neweggData)
    };

    res.json(retailerData);
  } catch (error) {
    console.error(`Error fetching retailer data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching retailer data', error });
  }
});

module.exports = router;