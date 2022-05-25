const wrhsAssets = require('./wrhs-assets');
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

describe('Warehouse Assets lifecycle', () => {
  let mockGasket;

  beforeEach(() => {
    const wrhsClient = {};
    wrhsClient.get = jest.fn();
    mockGasket = {
      config: {
        root: path.join(__dirname, '..', 'generator'),
        hcs: {
          devMode: false
        },
        wrhs: {
          fsCachePath: path.join(os.tmpdir(), '.test-wrhs-cache')
        }
      },
      wrhs: wrhsClient,
      logger: console
    };
  });

  it('fetches the package', async () => {
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName',
      version: '1.0.0',
      variant: 'en-US',
      data: {
        files: [
          {
            url: 'https://example.com/myfile.js',
            metadata: {
              chunk: false
            }
          }
        ],
        fingerprints: ['abcdefg.gz'],
        recommended: ['https://example.com/myfile.js']
      }
    });
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName2',
      version: '1.0.0',
      variant: 'it-IT',
      data: {
        files: [
          {
            url: 'https://example.com/myfile_it.js',
            metadata: {
              chunk: false
            }
          }
        ],
        fingerprints: ['beepboop123.gz'],
        recommended: ['https://example.com/myfile_it.js']
      }
    });

    const wrhsReqs = [
      {
        name: '@org/pkgName',
        version: '1.0.0',
        acceptedVariants: ['fr-FR', 'en-US']
      },
      {
        name: '@org/pkgName2',
        version: '1.0.0',
        acceptedVariants: ['it-IT', 'en-US']
      }
    ];

    const assets = await wrhsAssets(mockGasket.config, wrhsReqs);

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(
      `/objects/${encodeURIComponent('@org/pkgName')}`,
      {
        accepted_variants: 'fr-FR,en-US',
        env: 'development',
        version: '1.0.0'
      }
    );

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(
      `/objects/${encodeURIComponent('@org/pkgName2')}`,
      {
        accepted_variants: 'it-IT,en-US',
        env: 'development',
        version: '1.0.0'
      }
    );

    expect(assets).toEqual({
      '@org/pkgName': {
        files: [
          {
            url: 'https://example.com/myfile.js',
            metadata: {
              chunk: false
            }
          }
        ],
        fingerprints: ['abcdefg.gz'],
        recommended: ['https://example.com/myfile.js']
      },
      '@org/pkgName2': {
        files: [
          {
            url: 'https://example.com/myfile_it.js',
            metadata: {
              chunk: false
            }
          }
        ],
        fingerprints: ['beepboop123.gz'],
        recommended: ['https://example.com/myfile_it.js']
      }
    });
  });

  it('uses default accepted variants', async () => {
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName-no-variants',
      version: '1.0.0',
      variant: 'en-US',
      data: {
        files: [
          {
            url: 'https://example.com/pkgName.js',
            metadata: {
              chunk: false
            }
          }
        ],
        fingerprints: ['a12345.gz'],
        recommended: ['https://example.com/pkgName.js']
      }
    });

    const wrhsReqs = [
      {
        name: '@org/pkgName-no-variants',
        env: 'test',
        version: '1.0.0'
      }
    ];

    await wrhsAssets(mockGasket, wrhsReqs);

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(
      `/objects/${encodeURIComponent('@org/pkgName-no-variants')}`,
      {
        accepted_variants: 'en-US,en',
        env: 'test',
        version: '1.0.0'
      }
    );
  });

  describe('wrhs cache', () => {
    it('resolves the package from cache', async () => {
      mockGasket.wrhs.get = jest.fn(() => ({
        name: '@org/pkgName-for-cache',
        env: 'test',
        version: '1.0.0',
        variant: 'en-US',
        data: {}
      }));

      const wrhsReqs = [
        {
          name: '@org/pkgName-for-cache',
          env: 'test',
          version: '1.0.0',
          acceptedVariants: ['fr-FR', 'en-US']
        }
      ];

      // call twice
      await wrhsAssets(mockGasket, wrhsReqs);
      await wrhsAssets(mockGasket, wrhsReqs);

      expect(mockGasket.wrhs.get).toHaveBeenCalledTimes(1);
    });

    it('respects the ttl', async () => {
      mockGasket.wrhs.get = jest.fn(() => ({
        name: '@org/pkgName-for-cache2',
        env: 'test',
        version: '1.0.0',
        variant: 'en-US',
        data: {}
      }));

      const wrhsReqs = [
        {
          name: '@org/pkgName-for-cache2',
          env: 'test',
          version: '1.0.0',
          acceptedVariants: ['fr-FR', 'en-US'],
          ttl: 0
        }
      ];

      // call twice
      await wrhsAssets(mockGasket, wrhsReqs);
      await wrhsAssets(mockGasket, wrhsReqs);

      expect(mockGasket.wrhs.get).toHaveBeenCalledTimes(2);
    });
  });
});
