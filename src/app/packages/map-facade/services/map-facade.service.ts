import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService, IMapVisualizer } from '@ansyn/imagery';
import {
	ContextMenuShowAction,
	DbclickFeatureTriggerAction,
	HoverFeatureTriggerAction,
	MapInstanceChangedAction,
	MapSingleClickAction,
	PositionChangedAction,
} from '../actions';
import { CaseMapPosition, CaseMapState, defaultMapType, Overlay } from '@ansyn/core';
import { range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { AnnotationContextMenuTriggerAction, AnnotationDrawEndAction } from '../actions/map.actions';
import { AnnotationsContextMenuEvent } from '@ansyn/core/models';
import { VisualizerEvents } from '@ansyn/imagery/model/imap-visualizer';
import { Feature } from 'geojson';
import { MapInstanceChanged } from '@ansyn/imagery/imagery-component/manager/imagery.component.manager';

@Injectable()
export class MapFacadeService {
	subscribers: {[key: string]: any[]} = {};

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
					progress: 0,
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
	}

	initEmitters(id: string) {
		const communicator = this.imageryCommunicatorService.provide(id);
		const communicatorSubscribers = [];
		communicatorSubscribers.push(communicator.positionChanged.subscribe(this.positionChanged.bind(this)));
		communicatorSubscribers.push(communicator.singleClick.subscribe(this.singleClick.bind(this)));
		communicatorSubscribers.push(communicator.contextMenu.subscribe(this.contextMenu.bind(this)));
		communicator.getAllVisualizers().forEach((visualizer: IMapVisualizer) => {
			if (visualizer.events.has(VisualizerEvents.onHoverFeature)) {
				communicatorSubscribers.push(visualizer.events.get(VisualizerEvents.onHoverFeature).subscribe(this.hoverFeature.bind(this)));
			}

			if (visualizer.events.has(VisualizerEvents.doubleClickFeature)) {
				communicatorSubscribers.push(visualizer.events.get(VisualizerEvents.doubleClickFeature).subscribe(this.dbclickFeature.bind(this)));
			}

			if (visualizer.events.has(VisualizerEvents.drawEndPublisher)) {
				communicatorSubscribers.push(visualizer.events.get(VisualizerEvents.drawEndPublisher).subscribe(this.drawEndSubscriber.bind(this)));
			}

			if (visualizer.events.has(VisualizerEvents.contextMenuHandler)) {
				communicatorSubscribers.push(visualizer.events.get(VisualizerEvents.contextMenuHandler).subscribe(this.contextMenuHandlerSubscriber.bind(this)));
			}
		});
		communicatorSubscribers.push(communicator.mapInstanceChanged.subscribe(this.mapInstanceChanged.bind(this)));
		this.subscribers[id] = communicatorSubscribers;
		console.log(this.subscribers);
	}

	removeEmitters(id: string) {
		this.subscribers[id].forEach((subscriber) => subscriber.unsubscribe());
		delete this.subscribers[id];
		console.log(this.subscribers);
	}

	mapInstanceChanged($event: MapInstanceChanged) {
		this.store.dispatch(new MapInstanceChangedAction($event));
	}

	positionChanged($event: { id: string, position: CaseMapPosition }) {
		this.store.dispatch(new PositionChangedAction($event));
	}

	singleClick(event) {
		this.store.dispatch(new MapSingleClickAction(event));
	}

	contextMenu(event) {
		this.store.dispatch(new ContextMenuShowAction(event));
	}

	hoverFeature(event) {
		this.store.dispatch(new HoverFeatureTriggerAction(event));
	}

	dbclickFeature(event) {
		this.store.dispatch(new DbclickFeatureTriggerAction(event));
	}

	drawEndSubscriber(feature: Feature<any>) {
		this.store.dispatch(new AnnotationDrawEndAction(feature));
	}

	contextMenuHandlerSubscriber(payload: AnnotationsContextMenuEvent) {
		this.store.dispatch(new AnnotationContextMenuTriggerAction(payload));
	}


}
