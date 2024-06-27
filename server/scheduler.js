const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const scriptsDir = path.join(__dirname, 'scripts');

// Function to execute a Python script
function runPythonScript(scriptName, callback) {
    const scriptPath = path.join(scriptsDir, scriptName);
    console.log(`Starting execution of ${scriptName} at ${new Date().toISOString()}`);

    exec(`python3 ${scriptPath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error executing ${scriptName} at ${new Date().toISOString()}: ${err.message}`);
            return callback(err);
        }
        console.log(`${scriptName} output at ${new Date().toISOString()}: ${stdout}`);
        if (stderr) console.error(`${scriptName} stderr at ${new Date().toISOString()}: ${stderr}`);
        callback(null);
    });
}

// Function to run all scripts in sequence
function runAllScriptsSequentially() {
    runPythonScript('dell_scraper.py', (err) => {
        if (err) return;
        runPythonScript('newegg_scraper.py', (err) => {
            if (err) return;
            runPythonScript('bestbuy_scraper.py', (err) => {
                if (err) return;
                runPythonScript('compare_dell_newegg_current_date.py', (err) => {
                    if (err) return;
                    runPythonScript('compare_dell_bestbuy_current_date.py', (err) => {
                        if (err) return;
                        runPythonScript('product_page.py', (err) => {
                            if (err) return;
                            console.log('All scripts executed successfully');
                        });
                    });
                });
            });
        });
    });
}

// Schedule all scripts to run at midnight
cron.schedule('0 0 * * *', () => {
    runAllScriptsSequentially();
});

console.log('Scrapers and comparison scripts scheduled to run at midnight.');