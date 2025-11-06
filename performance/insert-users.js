const { insertTestUsers } = require('../playwright/support/database');

insertTestUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });