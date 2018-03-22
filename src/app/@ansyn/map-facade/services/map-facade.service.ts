import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import {
	ContextMenuShowAction,
	MapInstanceChangedAction,
	MapSingleClickAction,
	PositionChangedAction,
	MapPluginsInitialized
} from '../actions';
import { range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { CaseMapState, defaultMapType } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CaseMapPosition } from '@ansyn/core/models/case-map-position.model'
import { MapInstanceChanged } from '@ansyn/imagery/imagery/manager/imagery.component.manager';

@Injectable()
export class MapFacadeService {
	subscribers: {[key: string]: any[]} = {};

	mapsList$ = this.store.select(mapStateSelector).pluck<IMapState, CaseMapState[]>('mapsList');
	mapsList: CaseMapState[] = [];

	static isOverlayGeoRegistered(overlay: Overlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static setMapsDataChanges(oldMapsList, oldActiveMapId, layout): { mapsList?: CaseMapState[], activeMapId?: string } {
		const mapsList: CaseMapState[] = [];
		const activeMap = MapFacadeService.mapById(oldMapsList, oldActiveMapId);

		range(layout.mapsCount).forEach((index) => {
			if (oldMapsList[index]) {
				mapsList.push(oldMapsList[index]);
			} else {
				const mapStateCopy: CaseMapState = {
					id: UUID.UUID(),
					data: { position: null },
					mapType: defaultMapType,
					flags: {}
				};
				mapsList.push(mapStateCopy);
			}
		});

		const mapsListChange = { mapsList };

		/* activeMapId */
		const notExist = !mapsList.some(({ id }) => id === oldActiveMapId);
		if (notExist) {
			mapsList[mapsList.length - 1] = activeMap;
		}

		return { ...mapsListChange };
	}

	static activeMap(mapState: IMapState): CaseMapState {
		return MapFacadeService.mapById(mapState.mapsList, mapState.activeMapId);
	}

	static mapById(mapsList: CaseMapState[], mapId: string): CaseMapState {
		return mapsList.find(({ id }: CaseMapState) => id === mapId);
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		this.mapsList$.subscribe((mapsList) => this.mapsList = mapsList);
	}

	initEmitters(id: string) {
		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(
			communicator.positionChanged.subscribe(this.positionChanged.bind(this)),
			communicator.singleClick.subscribe(this.singleClick.bind(this)),
			communicator.contextMenu.subscribe(this.contextMenu.bind(this)),
			communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this)),
			communicator.mapPluginsInitialized.subscribe(this.mapPluginsInitialized.bind(this))
		);
		this.subscribers[id] = communicatorSubscribers;
	}

	removeEmitters(id: string) {
		this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
		delete this.subscribers[id];
	}

	mapInstanceChanged($event: MapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: CaseMapPosition }) {
		const mapInstance = <CaseMapState> MapFacadeService.mapById(this.mapsList, $event.id);
		this.store.dispatch(new PositionChangedAction({ ...$event, mapInstance }));
	}


	singleClick(event) {
		this.store.dispatch(new MapSingleClickAction(event));
	}

	contextMenu(event) {
		this.store.dispatch(new ContextMenuShowAction(event));
	}

	mapPluginsInitialized(event) {
		this.store.dispatch(new MapPluginsInitialized(event));
	}
}
