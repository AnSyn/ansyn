import { AnsynBuilder } from './ansyn-builder';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../app/app.module';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}



const overlay = {
	'id': 'LC80410372018051LGN00',
	'footprint': {
		'type': 'MultiPolygon',
		'coordinates': [[[[-119.45464065703361, 34.221987731476354], [-117.49034101969485, 33.8435279581249], [-117.98337041613146, 32.120404101964624], [-119.90912780210559, 32.49869792584401], [-119.45464065703361, 34.221987731476354]]]]
	},
	'sensorType': 'Landsat8L1G',
	'sensorName': 'Landsat8',
	'bestResolution': 30,
	'name': 'LC80410372018051LGN00',
	'imageUrl': 'https://tiles.planet.com/data/v1/Landsat8L1G/LC80410372018051LGN00/{z}/{x}/{y}.png?api_key=9f7afec0ebfb4e1ca0bf959a0050545b',
	'thumbnailUrl': 'https://api.planet.com/data/v1/item-types/Landsat8L1G/items/LC80410372018051LGN00/thumb?api_key=9f7afec0ebfb4e1ca0bf959a0050545b',
	'date': '2018-02-20T18:28:30.196Z',
	'photoTime': '2018-02-20T18:28:30.196489Z',
	'azimuth': 0,
	'sourceType': 'PLANET',
	'isGeoRegistered': true
};


fetch('/assets/config/app.config.json')
	.then(response => response.json())
	.then(config => {
		const ansynBuilder = new AnsynBuilder('ansynMap', config, (api) => {
				setTimeout(() => {
					api.displayOverLay(overlay);
					api.mapPosition$.subscribe(({payload}) => console.log(payload.position))
					api.pointerMove$.subscribe((res) => console.log(res))
				}, 5000);
			},
			{
				sourceProviders: []
			});

	});


