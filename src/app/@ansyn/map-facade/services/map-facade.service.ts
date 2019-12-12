import { CommunicatorEntity } from './../../imagery/communicator-service/communicator.entity';
import { Injectable } from '@angular/core';
import {
	getPolygonIntersectionRatio,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapInstanceChanged,
	IMapSettings
} from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { saveAs } from 'file-saver';
import { EMPTY, Observable } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import {
	ExportMapsToPngActionFailed,
	ExportMapsToPngActionSuccess,
	MapInstanceChangedAction,
	PositionChangedAction,
	SetMinimalistViewModeAction
} from '../actions/map.actions';
import { LayoutKey } from '../models/maps-layout';
import { IMapState, selectLayout, selectMapsIds, selectMapsList } from '../reducers/map.reducer';
import domtoimage from 'dom-to-image';

// @dynamic
@Injectable({
	providedIn: 'root'
})
export class MapFacadeService {
	subscribers: { [key: string]: any[] } = {};

	mapsList$ = this.store.select(selectMapsList);
	mapsList: IMapSettings[] = [];

	layout: LayoutKey;
	layout$ = this.store.select(selectLayout);

	static isNotIntersect(extentPolygon, footprint, overlayCoverage): boolean {
		const intersection = getPolygonIntersectionRatio(extentPolygon, footprint);
		return intersection < overlayCoverage;
	}

	// @todo IOveraly
	static isOverlayGeoRegistered(overlay: any): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered !== 'notGeoRegistered';
	}

	static activeMap(mapState: IMapState): IMapSettings {
		return mapState.entities[mapState.activeMapId];
	}

	static mapById(mapsList: IMapSettings[], mapId: string): IMapSettings {
		if (!Boolean(mapsList)) {
			return undefined;
		}

		return mapsList.find(({ id }: IMapSettings) => {
			return id === mapId;
		});
	}

	constructor(protected store: Store<IMapState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		(<Observable<any>>this.mapsList$).subscribe((mapsList) => this.mapsList = mapsList);
		(<Observable<any>>this.layout$).subscribe((layout) => this.layout = layout);
	}

	initEmitters(id: string) {
		this.removeEmitters(id);

		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe((position) => this.positionChanged({
				id: communicator.id,
				position
			})),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this))
		);
		this.subscribers[id] = communicatorSubscribers;
	}

	removeEmitters(id: string) {
		if (this.subscribers[id]) {
			this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
			delete this.subscribers[id];
		}
	}

	mapInstanceChanged($event: IMapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: ImageryMapPosition }) {
		if (Boolean(this.mapsList)) {
			const mapInstance = <IMapSettings>MapFacadeService.mapById(this.mapsList, $event.id);
			this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
		}
	}

	async exportMapsToPng(element: Element | string = null) {
		this.store.dispatch(new SetMinimalistViewModeAction(true));
		await setTimeout(async () => {
		try {
			if (element === null) {
				const ELEMENT_SELECTOR = 'ansyn-imageries-manager';
				element = document.getElementsByTagName(ELEMENT_SELECTOR).item(0);
			} else if (typeof element === 'string') {
				element = document.getElementsByTagName(element).item(0);
			}
			if (element === null) {
				this.store.dispatch(new ExportMapsToPngActionFailed(`source for maps export could not be found.`));
				return;
			}

			const blob: Blob = await domtoimage.toBlob(element);
			saveAs(blob, 'map.jpeg');
			this.store.dispatch(new SetMinimalistViewModeAction(false));
			this.store.dispatch(new ExportMapsToPngActionSuccess());
		} catch (err) {
			this.store.dispatch(new ExportMapsToPngActionFailed(err));
		}
	}, 100);
	}
}
