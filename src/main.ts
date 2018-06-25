import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from './app/app/app.module';
import { fetchConfigProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { configuration } from './configuration/configuration';
import { enableProdMode } from '@angular/core';

if (configuration.production) {
	enableProdMode();
}

fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
// "imageryConfig": {
// 	"geoMapsInitialMapSource": [
// 		{
// 			"mapType": "openLayersMap",
// 			"mapSource": "{{ getv "/ansyn/imagery/mapsource" "ESRI_4326" }}",
// 			"mapSourceMetadata": {
// 				"key": "AsVccaM44P5n-GYKXaV0oVGdTI665Qx_sMgYBSYRxryH2pLe92iVxUgEtwIt8des",
// 				"styles": [
// 					"AerialWithLabels"
// 				]
// 			}
// 		},
// 		{
// 			"mapType": "cesiumMap",
// 			"mapSource": "OSM",
// 			"mapSourceMetadata": null
// 		},
// 		{
// 			"mapType": "disabledOpenLayersMap",
// 			"mapSource": "{{ getv "/ansyn/imagery/mapsource" "ESRI_4326" }}",
// 			"mapSourceMetadata": {
// 				"key": "AsVccaM44P5n-GYKXaV0oVGdTI665Qx_sMgYBSYRxryH2pLe92iVxUgEtwIt8des",
// 				"styles": [
// 					"AerialWithLabels"
// 				]
// 			}
// 		}
// 	],
// 		"maxCachedLayers": 100
// },
