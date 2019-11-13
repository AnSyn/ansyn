import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	AnsynApi,
	GeoRegisteration,
	IOverlay,
	IOverlaysCriteria,
	PhotoAngle,
	RegionContainment,
	selectMiscOverlays,
	selectOverlaysArray,
	SetMiscOverlay
} from '@ansyn/ansyn';
import { FeatureCollection, Point, Polygon } from 'geojson';
import {
	AnnotationMode,
	AnnotationsVisualizer,
	OpenLayerMarcoSourceProviderSourceType,
	OpenLayersStaticImageSourceProviderSourceType
} from '@ansyn/ol';
import * as momentNs from 'moment';
import { take, tap } from 'rxjs/operators';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';

const moment = momentNs;

@Component({
	selector: 'ansyn-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class SandboxComponent implements OnInit, OnDestroy {

	@AutoSubscription
	miscOverlays$ = this.store$.select(selectMiscOverlays).pipe(
		tap(x => console.log('sandbox', 'miscOverlays', x))
	);

	currentOverlays: IOverlay[];
	layerId: string;
	needToShowLayer = true;

	@AutoSubscription
	currentOverlays$ = this.store$.select(selectOverlaysArray).pipe(
		tap(x => console.log('sandbox', 'overlays array', x)),
		tap((x: IOverlay[]) => this.currentOverlays = x)
	);

	overlays = [
		this.overlay('000', OpenLayersStaticImageSourceProviderSourceType, 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reeipublic_Banana.gif', null, GeoRegisteration.notGeoRegistered, 'vis', null, 576, 1024),
		this.overlay('111', OpenLayersStaticImageSourceProviderSourceType, 'https://image.shutterstock.com/image-vector/cool-comic-book-bubble-text-450w-342092249.jpg', null, GeoRegisteration.notGeoRegistered, 'vis', null, 470, 450),
		this.overlay('222', OpenLayersStaticImageSourceProviderSourceType, 'https://imgs.xkcd.com/comics/online_communities.png', null, GeoRegisteration.notGeoRegistered, 'vis', null, 1024, 968),
		this.overlay('333', OpenLayersStaticImageSourceProviderSourceType, 'https://image.shutterstock.com/z/stock-vector-cool-milkshake-190524542.jpg', null, GeoRegisteration.notGeoRegistered, 'vis', null, 1600, 1500)
	];

	overlay(id: string, sourceType: string, imageUrl: string, footprint: any, geoRegistered: GeoRegisteration = GeoRegisteration.notGeoRegistered, sensorType: string = 'mySensorType', sensorName: string = 'mySensorName', imageWidth?: number, imageHeight?: number): IOverlay {
		const days = 10 * Math.random();
		const date = moment().subtract(days, 'day').toDate();
		const left = -117.94,
			top = 33.82,
			width = 0.05,
			height = 0.02,
			right = left + width * Math.random(),
			bottom = top - height * Math.random();
		return {
			name: id,
			id: id,
			photoTime: date.toISOString(),
			date: date,
			azimuth: 0,
			approximateTransform: 'Identity',
			isGeoRegistered: geoRegistered,
			containedInSearchPolygon: RegionContainment.unknown,
			sourceType: sourceType,
			tag: {
				imageData: {
					imageWidth: imageWidth,
					imageHeight: imageHeight
				}
			},
			footprint: footprint ? footprint : {
				type: 'MultiPolygon',
				coordinates: [[[
					[left, top],
					[right, top],
					[right, bottom],
					[left, bottom],
					[left, top]
				]]]
			},
			baseImageUrl: '',
			imageUrl: imageUrl,
			thumbnailUrl: '',
			sensorName: sensorName,
			sensorType: sensorType,
			bestResolution: 1,
			cloudCoverage: 1,
			photoAngle: PhotoAngle.vertical
		};
	}

	constructor(protected ansynApi: AnsynApi,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	setPositionByRadius() {
		let center: Point = {
			type: 'Point',
			coordinates: [-117.914, 33.811]
		};
		this.ansynApi.setMapPositionByRadius(center, 100, true);
	}

	setPositionByRect() {
		let rect: Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[-118.02, 33.69],
					[-118.09, 33.69],
					[-118.09, 33.72],
					[-118.02, 33.72],
					[-118.02, 33.69]
				]
			]
		};
		this.ansynApi.setMapPositionByRect(rect);
	}

	setOverlayCriteria() {
		let criteria: IOverlaysCriteria = {
			region: {
				type: 'Point',
				coordinates: [-118.29, 33.60]
			}
		};
		this.ansynApi.setOverlaysCriteria(criteria);
	}

	showDefaultLayer() {
		this.needToShowLayer = !this.needToShowLayer;
		this.ansynApi.showLayer(this.ansynApi.defaultLayerId, this.needToShowLayer);
	}

	displayOverlay() {
		this.ansynApi.displayOverLay(this.overlays[0]);
	}

	displayOverlaysOnTwoMaps() {
		this.ansynApi.changeMapLayout('layout2').pipe(
			tap(() => {
				this.ansynApi.setOverlays(this.overlays);
				this.ansynApi.displayOverLay(this.overlays[1], 0);
				this.ansynApi.displayOverLay(this.overlays[2], 1);
			}),
			take(1)
		).subscribe();
	}

	setOverlays() {
		this.ansynApi.setOverlays(this.overlays);
	}

	setLayout2maps() {
		this.ansynApi.changeMapLayout('layout2');
	}

	setMarcoOverlays() {
		const overlays = [
			this.overlay('M000', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_RGB_8bpp.j2k', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_RGB_8_j2k', 576, 1024),
			this.overlay('M001', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_RGB_16bpp.j2k', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_RGB_16_j2k', 576, 1024),
			this.overlay('M002', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_4Band_16bpp.tif', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_4Band_16_tif', 576, 1024),
			this.overlay('M003', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_4Band_8bpp.tif', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_4Band_8_tif', 576, 1024),
			this.overlay('M004', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_IR_16bpp.j2k', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_IR_16bpp_j2k', 576, 1024),
			this.overlay('M005', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_IR_8bpp.j2k', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_IR_8bpp_j2k', 576, 1024),
			this.overlay('M006', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/OGN_IR_8bpp.tif', null, GeoRegisteration.notGeoRegistered, 'vis', 'OGN_IR_8bpp_tif', 576, 1024)// ,
			// this.overlay('M007', OpenLayerMarcoSourceProviderSourceType, 's3://mp-images/14DEC08015334-S2AS_R1C1-054168615010_01_P001.TIF', 576, 1024, '14DEC08015334_tif')
		];
		this.ansynApi.setOverlays(overlays);
	}

	loadImageToCesium() {

	}

	setMiscOverlays() {
		if (this.currentOverlays.length > 0) {
			this.store$.dispatch(new SetMiscOverlay({ key: 'example', overlay: this.currentOverlays[0] }))
		} else {
			console.warn('Cannot set misc overlays because there are no query overlays');
		}
	}

	setRotation() {
		this.ansynApi.setRotation(100);
	}

	setAnnotationsWithIcons() {
		let center: Point = {
			type: 'Point',
			coordinates: [-117.9402, 33.8181]
		};
		this.ansynApi.setMapPositionByRadius(center, 5000, true);
		this.ansynApi.setAnnotations({
			'type': 'FeatureCollection',
			'features': [
				{
					'type': 'Feature',
					'geometry': {
						'type': 'Point',
						'coordinates': [
							-117.94590568490094,
							33.816596031188965
						]
					},
					'properties': {
						'id': 'efecb919-089e-d5e6-9ab3-3b3b73d9d9c8',
						'style': {
							'opacity': 1,
							'initial': {
								'fill': '#ff0080',
								'stroke': '#ff80c0',
								'stroke-width': 1,
								'fill-opacity': 0.4,
								'marker-size': 'medium',
								'marker-color': '#ff0080',
								'label': {
									'overflow': true,
									'font': '27px Calibri,sans-serif',
									'stroke': '#000',
									'fill': 'white'
								},
								'stroke-opacity': 1
							}
						},
						'showMeasures': false,
						'showLabel': false,
						'label': '',
						'mode': 'Point',
						'icon': 'assets/icons/map/entity-marker.svg'
					}
				},
				{
					'type': 'Feature',
					'geometry': {
						'type': 'Polygon',
						'coordinates': [
							[
								[
									-117.93876457057195,
									33.82112789180246
								],
								[
									-117.92475700378418,
									33.82112789180246
								],
								[
									-117.92475700378418,
									33.817145347071346
								],
								[
									-117.93876457057195,
									33.817145347071346
								],
								[
									-117.93876457057195,
									33.82112789180246
								]
							]
						]
					},
					'properties': {
						'id': '79bbd5d3-6df8-f861-d036-7589555673a9',
						'style': {
							'opacity': 1,
							'initial': {
								'fill': '#400040',
								'stroke': '#008040',
								'stroke-width': 1,
								'fill-opacity': 0.4,
								'marker-size': 'medium',
								'marker-color': '#400040',
								'label': {
									'overflow': true,
									'font': '27px Calibri,sans-serif',
									'stroke': '#000',
									'fill': 'white'
								},
								'stroke-opacity': 1
							}
						},
						'showMeasures': false,
						'showLabel': false,
						'label': '',
						'mode': 'Rectangle',
						'icon': 'assets/logo.svg'
					}
				}
			]
		});
	}

	getOverlayData() {
		console.log(this.ansynApi.getOverlayData());
	}

	getAllOverlaysData() {
		this.ansynApi.getOverlays().pipe(
			tap(x => console.log('sandbox', 'getAllOverlaysData method', x))
		).subscribe();
	}

	footerCollapse(collapse) {
		this.ansynApi.collapseFooter(JSON.parse(collapse));

	}

	undeletableAnnotations() {
		this.ansynApi.setAnnotations({
			'type': 'FeatureCollection',
			'features': [
				{
					'type': 'Feature',
					'geometry': {
						'type': 'Point',
						'coordinates': [
							-117.94590568490094,
							33.816596031188965
						]
					},
					'properties': {
						'id': 'efecb919-089e-d5e6-9ab3-3b3b73d9d9c8',
						'style': {
							'opacity': 1,
							'initial': {
								'fill': '#ff0080',
								'stroke': '#ff80c0',
								'stroke-width': 1,
								'fill-opacity': 0.4,
								'marker-size': 'medium',
								'marker-color': '#ff0080',
								'label': {
									'overflow': true,
									'font': '27px Calibri,sans-serif',
									'stroke': '#000',
									'fill': 'white'
								},
								'stroke-opacity': 1
							}
						},
						'showMeasures': false,
						'showLabel': false,
						'label': '',
						'mode': 'Point',
						'undeletable': true
					}
				}
			]
		})
	}

	collapseAll() {
		this.ansynApi.collapseFooter(true);
		this.ansynApi.collapseMenu(true);
		this.ansynApi.hideMeasurePanel(true);
	}

	unCollapseAll() {
		this.ansynApi.collapseFooter(false);
		this.ansynApi.collapseMenu(false);
		this.ansynApi.hideMeasurePanel(false);
	}

	insertLayer() {
		const layer: FeatureCollection = {
			'type': 'FeatureCollection',
			'features': [{
				'type': 'Feature',
				'geometry': { 'type': 'Point', 'coordinates': [-122.3865658852983, 37.62603244149734] },
				'properties': {
					'id': 'dcfa10f2-7b49-3151-5126-954c1a3305e0',
					'style': {
						'opacity': 1,
						'initial': {
							'fill': '#ffffff',
							'stroke': '#27b2cf',
							'stroke-width': 1,
							'fill-opacity': 0.4,
							'stroke-opacity': 1,
							'marker-size': 'medium',
							'marker-color': '#ffffff',
							'label': {
								'overflow': true,
								'font': '27px Calibri,sans-serif',
								'stroke': '#000',
								'fill': 'white'
							}
						}
					},
					'showMeasures': false,
					'label': '',
					'icon': '',
					'undeletable': false,
					'mode': 'Point'
				}
			}, {
				'type': 'Feature',
				'geometry': {
					'type': 'LineString',
					'coordinates': [[-122.38998010946246, 37.62742342165281], [-122.39137109122585, 37.62379844287092], [-122.39006441323906, 37.62198595347998], [-122.3879568670617, 37.62232316054677]]
				},
				'properties': {
					'id': 'c9bd6965-8b3c-143c-4ce3-381753621935',
					'style': {
						'opacity': 1,
						'initial': {
							'fill': '#ffffff',
							'stroke': '#27b2cf',
							'stroke-width': 1,
							'fill-opacity': 0.4,
							'stroke-opacity': 1,
							'marker-size': 'medium',
							'marker-color': '#ffffff',
							'label': {
								'overflow': true,
								'font': '27px Calibri,sans-serif',
								'stroke': '#000',
								'fill': 'white'
							}
						}
					},
					'showMeasures': false,
					'label': '',
					'icon': '',
					'undeletable': false,
					'mode': 'LineString'
				}
			}, {
				'type': 'Feature',
				'geometry': {
					'type': 'Polygon',
					'coordinates': [[[-122.37396275851451, 37.6248522159596], [-122.37122294848395, 37.619962707863365], [-122.37792494597112, 37.62042636898715], [-122.37944237857565, 37.62392489531998], [-122.37396275851451, 37.6248522159596]]]
				},
				'properties': {
					'id': '64c65741-d1e4-7faa-2a5e-65f4e00a7fc7',
					'style': {
						'opacity': 1,
						'initial': {
							'fill': '#af0505',
							'stroke': '#27b2cf',
							'stroke-width': 7,
							'fill-opacity': 0.4,
							'stroke-opacity': 0,
							'marker-size': 'medium',
							'marker-color': '#af0505',
							'label': {
								'overflow': true,
								'font': '27px Calibri,sans-serif',
								'stroke': '#000',
								'fill': 'white'
							}
						}
					},
					'showMeasures': false,
					'label': '',
					'icon': '',
					'undeletable': false,
					'mode': 'Polygon'
				}
			}, {
				'type': 'Feature',
				'geometry': {
					'type': 'Polygon',
					'coordinates': [[[-122.38508709430224, 37.621606594524884], [-122.38516977341148, 37.622446049608556], [-122.38541463342742, 37.62325324490413], [-122.38581226451696, 37.623997160349084], [-122.38634738594031, 37.624649207690055], [-122.38699943328128, 37.62518432911341], [-122.38774334872623, 37.62558196020294], [-122.38855054402181, 37.625826820218876], [-122.38938999910548, 37.625909499328124], [-122.39022945418914, 37.625826820218876], [-122.39103664948472, 37.62558196020294], [-122.39178056492968, 37.62518432911341], [-122.39243261227064, 37.624649207690055], [-122.392967733694, 37.623997160349084], [-122.39336536478353, 37.62325324490413], [-122.39361022479947, 37.622446049608556], [-122.39369290390871, 37.621606594524884], [-122.39361022479947, 37.62076713944121], [-122.39336536478353, 37.61995994414564], [-122.392967733694, 37.619216028700684], [-122.39243261227064, 37.61856398135971], [-122.39178056492968, 37.61802885993636], [-122.39103664948472, 37.617631228846825], [-122.39022945418914, 37.61738636883089], [-122.38938999910548, 37.617303689721645], [-122.38855054402181, 37.61738636883089], [-122.38774334872623, 37.617631228846825], [-122.38699943328128, 37.61802885993636], [-122.38634738594031, 37.61856398135971], [-122.38581226451696, 37.619216028700684], [-122.38541463342742, 37.61995994414564], [-122.38516977341148, 37.62076713944121], [-122.38508709430224, 37.621606594524884]]]
				},
				'properties': {
					'id': 'bf8fa21d-d98e-40a1-7c33-669016a18c88',
					'style': {
						'opacity': 1,
						'initial': {
							'fill': '#af0505',
							'stroke': '#0498b6',
							'stroke-width': 7,
							'fill-opacity': 0,
							'stroke-opacity': 1,
							'marker-size': 'medium',
							'marker-color': '#af0505',
							'label': {
								'overflow': true,
								'font': '27px Calibri,sans-serif',
								'stroke': '#000',
								'fill': 'white'
							}
						}
					},
					'showMeasures': false,
					'label': 'test',
					'icon': '',
					'undeletable': false,
					'mode': 'Circle'
				}
			}]
		};
		this.layerId = this.ansynApi.insertLayer('test', layer);
	}

	removeLayer() {
		this.ansynApi.removeLayer(this.layerId);
	}

	showLayer() {
		this.needToShowLayer = !this.needToShowLayer;
		this.ansynApi.showLayer(this.layerId, this.needToShowLayer);
	}

	startDrag() {
		const plugin: AnnotationsVisualizer = this.imageryCommunicatorService.communicatorsAsArray()[0].getPlugin(AnnotationsVisualizer);
		plugin.setMode(AnnotationMode.Translate, false);
	}

	stopDrag() {
		const plugin: AnnotationsVisualizer = this.imageryCommunicatorService.communicatorsAsArray()[0].getPlugin(AnnotationsVisualizer);
		plugin.setMode(null, false);
	}
}
