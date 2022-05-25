const getWarehouse = require('./get-warehouse');

const fs = require('fs');
const os = require('os');
const path = require('path');

beforeAll(() => {
  try {
    // remove the wrhs fs cache for tests
    // eslint-disable-next-line no-sync
    fs.rmdirSync(path.join(os.tmpdir(), '.test-wrhs-cache'), { recursive: true });
  } catch (e) {
    // ignore
  }
});
