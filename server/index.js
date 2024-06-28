const express = require('express');
const path = require('path');
const fs = require('fs');
const csvtojson = require('csvtojson');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = express.Router();

// Import the routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productsRoutes = require('./routes/products');
const retailersRoutes = require('./routes/retailers');
const dataRoutes = require('./routes/data');

// Load environment variables
const { CORS_ORIGIN, DATA_DIR } = process.env;

// Enable CORS for all routes
const allowedOrigins = ['http://localhost:3000', 'https://spectra-de1476b6df25.herokuapp.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Use the routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/retailers', retailersRoutes);
app.use('/api/data', dataRoutes);

// Function to get the current date in the desired format
function getCurrentDate() {
  const current_time = new Date();
  return `${current_time.getFullYear()}${String(current_time.getMonth() + 1).padStart(2, '0')}${String(current_time.getDate()).padStart(2, '0')}`;
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Platform-specific logging
if (process.platform === 'win32') {
  console.log('Running on Windows');
} else if (process.platform === 'darwin') {
  console.log('Running on macOS');
} else {
  console.log('Running on a non-Windows, non-macOS platform');
}

// Endpoint to fetch Dell data
router.get('/dell', async (req, res) => {
  const date = getCurrentDate();
  const dellFilePath = path.join(DATA_DIR, `official_dell_monitor_${date}.csv`);

  console.log(`Fetching Dell data from: ${dellFilePath}`); // Debug log

  try {
    if (!fs.existsSync(dellFilePath)) {
      console.error(`File does not exist: ${dellFilePath}`);
      return res.status(404).json({ message: `File does not exist: ${dellFilePath}` });
    }

    const dellData = await csvtojson().fromFile(dellFilePath);
    res.json(dellData);
  } catch (error) {
    console.error(`Error fetching Dell data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching Dell data', error });
  }
});

// Endpoint to fetch BestBuy comparison data
router.get('/compare/dell-bestbuy', async (req, res) => {
  const date = getCurrentDate();
  const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);

  console.log(`Fetching BestBuy data from: ${bestbuyFilePath}`); // Debug log

  try {
    const bestbuyData = await csvtojson().fromFile(bestbuyFilePath);
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

  console.log(`Fetching Newegg data from: ${neweggFilePath}`); // Debug log

  try {
    const neweggData = await csvtojson().fromFile(neweggFilePath);
    res.json(neweggData);
  } catch (error) {
    console.error(`Error fetching Newegg data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching Newegg data', error });
  }
});

// Endpoint to fetch dashboard data
router.get('/dashboard', async (req, res) => {
  const date = getCurrentDate();
  try {
    const dellFilePath = path.join(DATA_DIR, `official_dell_monitor_${date}.csv`);
    const bestbuyFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);
    const neweggFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

    console.log('Checking file paths:');
    console.log(`      Dell: ${dellFilePath}`);
    console.log(`      BestBuy: ${bestbuyFilePath}`);
    console.log(`      Newegg: ${neweggFilePath}`);

    const [dellData, bestbuyData, neweggData] = await Promise.all([
      csvtojson().fromFile(dellFilePath),
      csvtojson().fromFile(bestbuyFilePath),
      csvtojson().fromFile(neweggFilePath)
    ]);

    const totalOffenders = 2; // Assuming monitoring BestBuy and Newegg
    const bestbuyTop5 = bestbuyData.sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);
    const neweggTop5 = neweggData.sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);
    const totalDeviatedProductsBestBuy = bestbuyData.filter(item => item.Deviation !== 0).length;
    const totalDeviatedProductsNewegg = neweggData.filter(item => item.Deviation !== 0).length;
    const averageDeviationBestBuy = bestbuyData.reduce((sum, item) => sum + parseFloat(item.Deviation), 0) / bestbuyData.length;
    const averageDeviationNewegg = neweggData.reduce((sum, item) => sum + parseFloat(item.Deviation), 0) / neweggData.length;
    const complianceRateBestBuy = (bestbuyData.filter(item => item.Status === 'Green').length / bestbuyData.length) * 100;
    const complianceRateNewegg = (neweggData.filter(item => item.Status === 'Green').length / neweggData.length) * 100;

    const combinedTopOffenders = [...bestbuyTop5, ...neweggTop5].sort((a, b) => a.Deviation - b.Deviation).slice(0, 5);

    const dashboardData = {
      totalOffenders,
      bestbuyTop5,
      neweggTop5,
      totalDeviatedProductsBestBuy,
      totalDeviatedProductsNewegg,
      averageDeviationBestBuy,
      averageDeviationNewegg,
      complianceRateBestBuy,
      complianceRateNewegg,
      combinedTopOffenders
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(`Error fetching dashboard data: ${error.message}`);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
});

// Endpoint to fetch combined product data
app.get('/api/data/products', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `combined_product_data_${date}.csv`);

  console.log(`Fetching combined product data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

// Endpoint to fetch Dell-BestBuy comparison data
app.get('/api/data/compare/dell-bestbuy', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `bestbuy_comparison_${date}.csv`);

  console.log(`Fetching Dell-BestBuy comparison data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

// Endpoint to fetch Dell-Newegg comparison data
app.get('/api/data/compare/dell-newegg', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `newegg_comparison_${date}.csv`);

  console.log(`Fetching Dell-Newegg comparison data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

// Endpoint to fetch BestBuy Dell monitors data
app.get('/api/data/bestbuy', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `bestbuy_dell_monitor_${date}.csv`);

  console.log(`Fetching BestBuy Dell monitors data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

// Endpoint to fetch Newegg Dell monitors data
app.get('/api/data/newegg', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `newegg_dell_monitor_${date}.csv`);

  console.log(`Fetching Newegg Dell monitors data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

// Endpoint to fetch Dell monitors data
app.get('/api/data/dell', (req, res) => {
  const date = getCurrentDate();
  const csvFilePath = path.join(DATA_DIR, `official_dell_monitor_${date}.csv`);

  console.log(`Fetching Dell monitors data from: ${csvFilePath}`); // Debug log

  csvtojson()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.json(jsonObj);
    })
    .catch((err) => {
      console.error(`Error reading CSV file: ${err.message}`);
      res.status(500).json({ message: 'Error reading CSV data', error: err });
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});