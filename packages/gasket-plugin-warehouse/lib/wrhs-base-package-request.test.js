const wrhsBasePackageRequest = require('./wrhs-base-package-request.js');

describe('wrhs base package request', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '../',
        hcs: {
          devMode: false
        }
      },
      metadata: {
        app: {
          package: {
            name: '@ux/application-sidebar',
            version: '0.0.0'
          }
        }
      }
    };
  });

  it('returns undefined for local', () => {
    const wrhsRequests = wrhsBasePackageRequest({
      config: {
        env: 'local'
      }
    });
    expect(wrhsRequests).toBeUndefined();
  });

  it('returns base package', () => {
    const wrhsRequests = wrhsBasePackageRequest(mockGasket);
    expect(wrhsRequests).toEqual({
      acceptedVariants: ['en-US', 'en'],
      name: '@ux/application-sidebar',
      version: '0.0.0'
    });
  });

  it('uses default variants', () => {
    const wrhsRequests = wrhsBasePackageRequest(mockGasket, 'en-US');
    expect(wrhsRequests).toEqual({
      acceptedVariants: ['en-US', 'en'],
      name: '@ux/application-sidebar',
      version: '0.0.0'
    });
  });

  it('accepts non default variants', () => {
    const wrhsRequests = wrhsBasePackageRequest(mockGasket, 'nl-NL');
    expect(wrhsRequests).toEqual({
      acceptedVariants: ['nl-NL', 'nl', 'en-US', 'en'],
      name: '@ux/application-sidebar',
      version: '0.0.0'
    });
  });

  it('filters duplicate variants', () => {
    const wrhsRequests = wrhsBasePackageRequest(mockGasket, 'en-CA');
    expect(wrhsRequests).toEqual({
      acceptedVariants: ['en-CA', 'en', 'en-US'],
      name: '@ux/application-sidebar',
      version: '0.0.0'
    });
  });
});
