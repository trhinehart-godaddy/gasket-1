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
    // implementation
  };
