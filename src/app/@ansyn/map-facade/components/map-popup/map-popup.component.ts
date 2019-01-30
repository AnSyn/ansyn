import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import Overlay from 'ol/overlay';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { DOCUMENT } from '@angular/common';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { selectActiveMapId } from "../../reducers/map.reducer";
import { ImageryCommunicatorService } from "@ansyn/imagery";
import { PopupService } from "../../services/popup.service";
import { selectSelectedLayersIds } from "../../../menu-items/layers-manager/reducers/layers.reducer";

@Component({
	selector: 'ansyn-map-popup',
	templateUrl: './map-popup.component.html',
	styleUrls: ['./map-popup.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class MapPopupComponent implements OnInit {
	content: any;
	overlay: Overlay;
	currentLayer: any;

	@AutoSubscription
	arcgisLayer$ = this.store.select(selectSelectedLayersIds).pipe(
		map((layers) => this.currentLayer = layers)
	);

	@AutoSubscription
	$mapListener = combineLatest(this.communicatorService.instanceCreated, this.store.select(selectActiveMapId)).pipe(
		map(([instance, mapId]) => {
			const communicator = this.communicatorService.provide(mapId);
			return communicator ? communicator.ActiveMap.mapObject : false
		}),
		filter((mapObject) => !mapObject.listeners_.hasOwnProperty('singleclick')),
		map((mapObject) => {
			mapObject.on('singleclick', this.mapListener.bind(this));
			mapObject.addOverlay(this.overlay);
		}),
	);

	constructor(protected store: Store<any>,
				@Inject(DOCUMENT) protected document: any,
				protected communicatorService: ImageryCommunicatorService,
				protected popupService: PopupService) {
	}

	ngOnInit() {
		this.overlay = new Overlay({
			element: this.document.getElementById('ansynPopup'),
			autoPan: true,
		});
	}

	mapListener(ev) {
		if (this.currentLayer && this.currentLayer.includes('da6df5d1-4962-48a5-8645-7b9c674451ad')) {
			this.content = 'searching...';
			this.overlay.setPosition(ev.coordinate);
			this.popupService.getInfo(ev).pipe(
				map(resp => JSON.parse(resp)),
			).subscribe(({ features }) => {
				let _content = '<div>';
				if (!features || features.length === 0) {
					_content += "can't find";
				} else {
					features.forEach(({ attributes: attr }) => {
						const text = `<div>
 							<p> ID: ${attr.ID} </p>
 							<p>Update date: ${new Date(attr.Up_Date).toDateString()}</p>
 							<p>Grow category: ${attr.GrowthCat}</p>
 							<p>Grow name: ${attr.GrowthName}</p>
 							<p>Planet year: ${attr.PlantYear ? attr.PlantYear : ''}</p>
 							<p>Dunam: ${attr.Dunam}</p>
 							<p>Yeshuv name: ${attr.YeshuvName}</p>
 							</div>`;
						_content += text;
					});
				}
				_content += "</div>";
				this.content = _content;
			})
		}
	}

	close() {
		this.overlay.setPosition(undefined);
	}

	open(coord) {
		this.overlay.setPosition(coord)
	}
}
