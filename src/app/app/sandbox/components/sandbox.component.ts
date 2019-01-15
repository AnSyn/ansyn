import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point, Polygon } from 'geojson';
import { IOverlay, IOverlaysCriteria } from '@ansyn/core';
import { OpenLayersStaticImageSourceProviderSourceType } from '@ansyn/plugins';
import * as momentNs from 'moment';
import { take, tap } from 'rxjs/operators';

const moment = momentNs;

@Component({
	selector: 'ansyn-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
export class SandboxComponent implements OnInit {
	overlays = [
		this.overlay('000', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reeipublic_Banana.gif', 576, 1024),
		this.overlay('111', 'https://image.shutterstock.com/image-vector/cool-comic-book-bubble-text-450w-342092249.jpg', 470, 450),
		this.overlay('222', 'https://imgs.xkcd.com/comics/online_communities.png', 1024, 968),
		this.overlay('333', 'https://image.shutterstock.com/z/stock-vector-cool-milkshake-190524542.jpg', 1600, 1500)
	];

	overlay(id: string, imageUrl: string, imageWidth: number, imageHeight: number): IOverlay {
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
			isGeoRegistered: false,
			sourceType: OpenLayersStaticImageSourceProviderSourceType,
			tag: {
				imageData: {
					imageWidth: imageWidth,
					imageHeight: imageHeight
				}
			},
			footprint: {
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
			thumbnailUrl: imageUrl,
			sensorName: 'mySensorName',
			sensorType: 'mySensorType',
			bestResolution: 1,
			cloudCoverage: 1
		}
	}

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

}
