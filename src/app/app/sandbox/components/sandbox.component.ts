import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point, Polygon } from 'geojson';
import { IOverlay, IOverlaysCriteria } from '@ansyn/core';
import { OpenLayersStaticImageSourceProviderSourceType } from '@ansyn/plugins';

@Component({
	selector: 'ansyn-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
export class SandboxComponent implements OnInit {

	constructor(protected ansynApi: AnsynApi) {
	}

	ngOnInit() {
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

	displayOverlay() {
		const date = new Date();
		const overlay: IOverlay = {
			name: 'test1',
			id: 'test1',
			photoTime: date.toISOString(),
			date: date,
			azimuth: 0,
			isGeoRegistered: false,
			sourceType: OpenLayersStaticImageSourceProviderSourceType,
			tag: {
				imageData: {
					imageWidth: 1024,
					imageHeight: 968
				}
			},
			footprint: {
				type: 'MultiPolygon',
				coordinates: [[[
					[-117.93, 33.82],
					[-117.91, 33.82],
					[-117.91, 33.80],
					[-117.93, 33.80],
					[-117.93, 33.82]
				]]]
			},
			baseImageUrl: '',
			imageUrl: 'https://imgs.xkcd.com/comics/online_communities.png',
			thumbnailUrl: 'https://imgs.xkcd.com/comics/online_communities.png'
		};
		this.ansynApi.displayOverLay(overlay);
	}

}
