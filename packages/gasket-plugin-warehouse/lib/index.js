const wrhsAssets = require('./wrhs-assets.js');
const wrhsBasePackageRequest = require('./wrhs-base-package-request.js');

module.exports =
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
  async function getWarehouse(name, options = {}) {
    const { defaultWrhsPackageRequest = true } = gasket.config.hcs;

    const wrhsRequests = [];
    // append base package request to lifecycle results
    if (defaultWrhsPackageRequest) {
      wrhsRequests.push(wrhsBasePackageRequest(gasket, locale));
    }
    let wrhsAssetsResult = {};
    if (wrhsRequests.length) {
      wrhsAssetsResult = await wrhsAssets(gasket, wrhsRequests);
    }

    return wrhsAssetsResult;
  };
