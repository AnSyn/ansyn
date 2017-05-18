export const configuration = {
  production: false,
  CasesConfig: {
    casesBaseUrl: 'http://localhost:9001/api/v1/cases'
  },
  LayersManagerConfig: {
    layersByCaseIdUrl: 'http://localhost:9001/api/v1/cases'
  },
  OverlaysConfig: {
  	baseUrl: 'http://localhost:9001/api/v1/'
  	overlaysByCaseId:  'cases/:id/overlays'
  	defaultApi: 'overlays'
  }

};

