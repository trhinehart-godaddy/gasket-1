const DEFAULT_VARIANTS = ['en-US', 'en'];

// eslint-disable-next-line no-process-env
const { NODE_ENV } = process.env;

/**
 * @typedef {Object} WrhsObjectRequest
 * @property {string} name
 * @property {string} version
 * @property {string[]} acceptedVariants
 */

/**
 * Returns a list of base package assets that need to be fetched from warehouse
 * @param {Gasket} gasket Gasket instance
 * @param {string} [locale] Requested locale
 * @returns {WrhsObjectRequest} Base package request
 */
module.exports = function wrhsBasePackageRequest(gasket, locale = 'en-US') {
  console.log('NODE ENVV ', NODE_ENV);
  if ((!NODE_ENV && gasket.config.hcs.devMode) || gasket.config.env === 'local') {
    return;
  }

  const { name, version } = gasket.metadata.app.package;

  let acceptedVariants;
  if (DEFAULT_VARIANTS.includes(locale)) {
    acceptedVariants = DEFAULT_VARIANTS;
  } else {
    acceptedVariants = [locale, locale.split('-').shift(), ...DEFAULT_VARIANTS];
  }

  return {
    name,
    version,
    acceptedVariants: [...new Set(acceptedVariants)] // ensure no duplicates
  };
};
