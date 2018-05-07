import { AnsynApi } from '@builder/ansyn-api.service';
import { async, inject, TestBed } from '@angular/core/testing';
import { coreFeatureKey, CoreReducer, coreStateSelector, WindowLayout } from '@ansyn/core/reducers/core.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { GoToAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { LoadDefaultCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LayoutKey } from '@ansyn/core/models/layout-options.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';


describe('apiService', () => {
	let ansynApi: AnsynApi;
	let store: Store<any>;
	let projectionConverterService: ProjectionConverterService;
	let projectionService: ProjectionService;
	let imageryCommunicatorService: ImageryCommunicatorService;

	const coords = [
		[-117.89337288312173, 33.80392816773926],
		[-117.89308121984654, 33.803128387461086],
		[-117.89267289126127, 33.80223165523036],
		[-117.89241039431359, 33.80174693119338],
		[-117.89217706369344, 33.80140762273396],
		[-117.8921187310384, 33.80123796799978],
		[-117.89311038617407, 33.80140762273396],
		[-117.89057291567984, 33.8027406125144],
		[-117.88949376156158, 33.80295873613814],
		[-117.8892020982864, 33.80632746372551],
		[-117.90159778748237, 33.80804812952371],
		[-117.90699355807357, 33.80901750346732]

	];


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [StoreModule.forRoot({ [coreFeatureKey]: CoreReducer, [mapFeatureKey]: MapReducer })],
			providers: [
				AnsynApi, Actions, ProjectionConverterService, ProjectionService, ImageryCommunicatorService,
				{
					provide: toolsConfig, useValue: {
						Proj4: {
							ed50: '+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs',
							ed50Customized: ''
						}
					}
				}
			]
		}).compileComponents();
	}));


	beforeEach(
		inject([AnsynApi, Store, ProjectionConverterService, ProjectionService, ImageryCommunicatorService],
			(_ansynApi, _store, _projectionConverterService, _projectionService, _imageryCommunicatorService) => {
				projectionConverterService = _projectionConverterService;
				projectionService = _projectionService;
				imageryCommunicatorService = _imageryCommunicatorService;
				ansynApi = _ansynApi;
				store = _store;
			}));

	it('should create "ansynApi" service', () => {
		expect(ansynApi).toBeTruthy();
	});

	it('should go to location', () => {
		const position = [-117.91516415144629, 33.81021575723675];
		spyOn(store, 'dispatch');
		ansynApi.goToPosition(position);
		expect(store.dispatch).toHaveBeenCalledWith(new GoToAction(position));
	});

	it('should loadDefaultCase', () => {
		spyOn(store, 'dispatch');
		ansynApi.loadDefaultCase();
		expect(store.dispatch).toHaveBeenCalledWith(new LoadDefaultCaseAction());
	});

	it('should changeMapLayout', (done) => {
		const layout: LayoutKey = 'layout2';
		ansynApi.changeMapLayout(layout);
		store.select(coreStateSelector).subscribe((coreState) => {
			expect(coreState.layout).toEqual(layout);
			done();
		});

	});

	it('should displayOverLay', () => {
		const overlay: Overlay = {
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
			'date': new Date('2018-02-20T18:28:30.196Z'),
			'photoTime': '2018-02-20T18:28:30.196489Z',
			'azimuth': 0,
			'sourceType': 'PLANET',
			'isGeoRegistered': true
		};
		spyOn(store, 'dispatch');
		ansynApi.displayOverLay(overlay);
		expect(store.dispatch).toHaveBeenCalledWith(new DisplayOverlayAction({
			overlay,
			mapId: null,
			forceFirstDisplay: true
		}));
	});


	it('createCommunicator should raise instanceCreated event', (done) => {
		const windowLayout: WindowLayout = {
			menu: false,
			statusBar: true,
			timeLine: true,
			contextSun: true,
			toolsOverMenu: true
		};
		ansynApi.changeWindowLayout(windowLayout);
		store.select(coreStateSelector).subscribe((coreState) => {
			expect(coreState.windowLayout).toEqual(windowLayout);
			done();
		});
	});


});

// api.displayOverLay(overlay);
// api.getShadowMouse((pointerMove$ : EventEmitter<any>) => pointerMove$.subscribe(point => console.log(point)))
// api.mapPosition$.subscribe(position => console.log(position))
// setInterval(() => {
// 	api.setOutSourceMouseShadow(coords[Math.floor(Math.random() * 10)]);
// }, 1000);
