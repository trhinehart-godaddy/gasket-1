const Cache = require('out-of-band-cache');
const path = require('path');
const { Request } = require('wrhs');

/**
 * @typedef {Object} WrhsFile
 * @property {string} url
 * @property {Object} metadata
 *
 * @typedef {Object} WrhsData
 * @property {WrhsFile[]} files
 * @property {string[]} fingerprints
 * @property {string[]} recommended
 *
 * @typedef {Object} WrhsObjectVariant
 * @property {string} name
 * @property {string} env
 * @property {string} version
 * @property {string} variant
 * @property {WrhsData} data
 * @property {number} [ttl]
 *
 * @typedef {Object} wrhsPackageRequests
 * @property {string} name Name of the package
 * @property {string} env Environment
 * @property {string} version Version
 * @property {string[]} acceptedVariants List of variants
 * @property {number} [ttl] Time in milliseconds that the package response should be cached for
 */

/* eslint-disable no-process-env */
const { WRHS_USERNAME, WRHS_PASSWORD, WRHS_ENDPOINT } = process.env;
/* eslint-enable no-process-env */

const DEFAULT_VARIANTS = ['en-US', 'en'];
const DEFAULT_TTL = 10 * 60 * 1000; // default cache time is 10 minutes
let cache;

/**
 *
 * @param {Object} getterOptions Params for the getter function
 * @param {any} [getterOptions.client] Wrhs client
 * @param {string} [getterOptions.name] Name of the package
 * @param {string} [getterOptions.acceptedVariants] Accepted variants as string (comma separated)
 * @param {string} [getterOptions.env] Environment
 * @param {string} [getterOptions.version] Version
 * @returns {Function} The getter function for wrhs data that is passed on to the cache client
 */
function getWrhsDataGetter({ client, name, acceptedVariants, env, version }) {
  return async function () {
    /** @type WrhsObjectVariant | WrhsObjectVariant[] */
    const variant = await client.get(`/objects/${encodeURIComponent(name)}`, {
      accepted_variants: acceptedVariants,
      env,
      version
    });
    return variant;
  };
}

/**
 * Fetch assets from Warehouse based on the package version.
 * @param {Gasket} gasket Gasket instance
 * @param {wrhsPackageRequests[]} wrhsReqs Warehouse package requests
 * @returns {Promise<Object.<string, WrhsData>>} Warehouse response to the object request
 */
async function wrhsAssets(gasket, wrhsReqs = []) {
  if (gasket.env === 'local') {
    return {};
  }

  cache =
    cache ||
    new Cache({
      maxAge: DEFAULT_TTL,
      fsCachePath: gasket.wrhs?.fsCachePath || path.join(gasket.root, '.wrhs-cache')
    });

  const { baseUrl, username, password } = gasket?.wrhs || {};
  const client =
    gasket.wrhs ||
    new Request({
      baseUrl: baseUrl || WRHS_ENDPOINT,
      username: username || WRHS_USERNAME,
      password: password || WRHS_PASSWORD
    });

  /** @type WrhsObjectVariant[] */
  const variants = await Promise.all(
    wrhsReqs.map(async (wrhsReq) => {
      let { ttl = DEFAULT_TTL } = wrhsReq;
      const {
        name,
        env = gasket.env || 'development',
        version,
        acceptedVariants = DEFAULT_VARIANTS
      } = wrhsReq;
      const variants = acceptedVariants.join(',');
      const key = `${name}_${env}_${version}_${variants}`;

      if (ttl === -1) {
        ttl = 365 * 24 * 60 * 60 * 1000; // Cache for 365 days (one year)
      }

      /** @type WrhsObjectVariant | WrhsObjectVariant[] */
      const { value: variant, fromCache = false } = await cache.get(
        key,
        { maxAge: ttl, skipCache: ttl === 0 },
        getWrhsDataGetter({ client, name, acceptedVariants: variants, version, env })
      );

      if (fromCache) {
        console.log(`wrhs request for ${key} resolved from cache`);
      }

      // Be extra safe in case API changes in the future
      if (Array.isArray(variant)) {
        const [v] = variant;
        return v;
      }

      return variant;
    })
  );

  return variants.reduce((acc, variant) => {
    acc[variant.name] = variant.data;
    return acc;
  }, {});
}

module.exports = wrhsAssets;
