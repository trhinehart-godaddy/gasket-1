const wrhsAssets = require('./wrhs-assets.js');
const wrhsBasePackageRequest = require('./wrhs-base-package-request.js');

const DEFAULT_VARIANTS = ['en-US', 'en'];

/**
 * Retrieve Warehouse object from cache or new request
 *
 * @param {string} name - Name of package
 * @param {object} [options] - Options
 * @param {version} [options.version] - Version
 * @param {acceptedVariants} [options.acceptedVariants] - What variants to support
 * @param {env} [options.env] - Defaults to gasket.config
 * @returns {object} warehouse object
 */
async function getWarehouse(
  name,
  options = {
    acceptedVariants: DEFAULT_VARIANTS
  }
) {
  const wrhsRequests = [
    {
      name,
      version: options.version,
      acceptedVariants: options.acceptedVariants
    }
  ];

  //   }
  let wrhsAssetsResult = {};
  if (wrhsRequests.length) {
    wrhsAssetsResult = await wrhsAssets(options.env, wrhsRequests);
  }

  return wrhsAssetsResult;
}

module.exports = getWarehouse;
