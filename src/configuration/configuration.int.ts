export const configuration = {
  env: 'int',
  production: false,
  CasesConfig: {
    casesBaseUrl: 'http://localhost:9001/api/v1/cases'
  },
  LayersManagerConfig: {
    layersByCaseIdUrl: 'http://localhost:9001/api/v1/cases'
  },
  OverlaysConfig: {
  	baseUrl: 'http://localhost:9001/api/v1/',
  	overlaysByCaseId:  'case/:id/overlays',
  	defaultApi: 'overlays'
  }

};

