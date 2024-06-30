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
const { CORS_ORIGIN, DATA_DIR, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } = process.env;

// Enable CORS for all routes if the module is loaded
app.use(cors({
  origin: CORS_ORIGIN,
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

// Function to find the most recent file if the current date's file is not available
function findMostRecentFile(filePattern) {
  const files = fs.readdirSync(DATA_DIR);
  const regex = new RegExp(`${filePattern}_\\d{8}\\.csv`);
  const matchingFiles = files.filter(file => regex.test(file));

  if (matchingFiles.length === 0) {
    return null;
  }

  matchingFiles.sort((a, b) => {
    const dateA = a.match(/(\d{8})\.csv$/)[1];
    const dateB = b.match(/(\d{8})\.csv$/)[1];
    return dateB.localeCompare(dateA);
  });

  return matchingFiles[0];
}

// Data Fetch Endpoints
const createDataEndpoint = (route, filePattern) => {
  router.get(route, async (req, res) => {
    const date = getCurrentDate();
    let filePath = path.join(DATA_DIR, `${filePattern}_${date}.csv`);

    console.log(`Attempting to fetch data from: ${filePath}`); // Debug log

    try {
      if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);

        const mostRecentFile = findMostRecentFile(filePattern);
        if (!mostRecentFile) {
          console.error(`No recent files found for pattern: ${filePattern}`);
          return res.status(404).json({ message: `No recent files found for pattern: ${filePattern}. Please perform a manual scrape.` });
        }

        filePath = path.join(DATA_DIR, mostRecentFile);
        console.log(`Using most recent file: ${filePath}`);
      } else {
        console.log('Current date file found.');
      }

      const data = await csvtojson().fromFile(filePath);
      console.log(`Number of items in ${filePath}: ${data.length}`);
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        return res.status(500).json({ message: 'Error: Expected data to be an array' });
      }

      if (!fs.existsSync(filePath)) {
        console.log('Using most recent data. Please scrape for the most recent data.');
      }

      res.json(data);
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      res.status(500).json({ message: `Error fetching data from ${filePath}`, error });
    }
  });
};

// Define endpoints
createDataEndpoint('/dell', 'official_dell_monitor');
createDataEndpoint('/compare/dell-bestbuy', 'bestbuy_comparison');
createDataEndpoint('/compare/dell-newegg', 'newegg_comparison');
createDataEndpoint('/bestbuy', 'bestbuy_dell_monitor');
createDataEndpoint('/newegg', 'newegg_dell_monitor');
createDataEndpoint('/dashboard', 'combined_dashboard_data');

app.use('/api/data', router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});