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
	PositionChangedAction
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

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
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

	exportMapsToPng() {
		this.store.select(selectMapsIds).pipe(
			take(1),
			switchMap(async (mapsIds: string[]) => {
				const mapManagers: Set<any> = new Set<any>();

				mapsIds.forEach(currentMapId => {
					const currentProvider: CommunicatorEntity = this.imageryCommunicatorService.provide(currentMapId);
					const currentTargetElement: HTMLElement = currentProvider.ActiveMap.getTargetElement();
					const currentMapManager: HTMLElement = this.findParentMapManagerComponent(currentTargetElement);
					mapManagers.add(currentMapManager);
				});

			mapManagers.forEach((mapManager: HTMLElement ) => {
				domtoimage.toBlob(mapManager).then ((blob) => { saveAs(blob, 'map.jpeg'); })
											.catch((err) => { console.error(`could not export map: '${err}'`); });
				});
			}),
			tap(() => {
				this.store.dispatch(new ExportMapsToPngActionSuccess());
			}),
			catchError((err) => {
				this.store.dispatch(new ExportMapsToPngActionFailed(err));
				return EMPTY;
			})
		).subscribe();
	}

	private findParentMapManagerComponent (el): HTMLElement {
		const CONTAINER_SELECTOR = 'ansyn-imageries-manager';
		while ((el = el.parentElement)
				&& !((el.matches || el.matchesSelector).call(el, CONTAINER_SELECTOR ))) {}
		return el;
	}
}
