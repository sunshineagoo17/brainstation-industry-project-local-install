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

// Endpoint to fetch retailer data
router.get('/', async (req, res) => {
  const date = getCurrentDate();
  try {
    const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);
    const neweggFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

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