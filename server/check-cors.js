try {
    require('cors');
    console.log('CORS module is installed.');
  } catch (e) {
    console.error('CORS module is not installed.');
    process.exit(1);
  }
  