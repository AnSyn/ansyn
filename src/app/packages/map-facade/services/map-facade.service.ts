import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService, IMapVisualizer } from '@ansyn/imagery';
import {
	AddMapInstanceAction,
	ContextMenuShowAction,
	DbclickFeatureTriggerAction,
	HoverFeatureTriggerAction,
	MapInstanceChangedAction,
	MapSingleClickAction,
	PositionChangedAction,
	RemoveMapInstanceAction
} from '../actions';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { CaseMapState, defaultMapType, Overlay, Position } from '@ansyn/core';
import { cloneDeep, range } from 'lodash';
import { UUID } from 'angular2-uuid';
import { AnnotationContextMenuTriggerAction } from '../actions/map.actions';

@Injectable()
export class MapFacadeService {
	private _subscribers = [];

	static isOverlayGeoRegistered(overlay: Overlay): boolean {
		if (!overlay) {
			return true;
		}
		return overlay.isGeoRegistered;
	}

	static activeMap(mapState: IMapState): CaseMapState {
		return MapFacadeService.mapById(mapState.mapsList, mapState.activeMapId);
	}

	static mapById(mapsList: CaseMapState[], mapId: string): CaseMapState {
		return mapsList.find(({ id }) => id === mapId);
	}

	static setMapsDataChanges(oldMapsList, oldActiveMapId, layout): { mapsList?: CaseMapState[], activeMapId?: string } {
		let mapsListChange = {};
		const mapsList: CaseMapState[] = [];

		/* mapsList*/
		const activeMap = oldMapsList.find(({ id }) => id === oldActiveMapId);
		range(layout.mapsCount).forEach((index) => {
			if (oldMapsList[index]) {
				mapsList.push(oldMapsList[index]);
			} else {
				const mapStateCopy: CaseMapState = {
					id: UUID.UUID(),
					progress: 0,
					data: { position: cloneDeep(activeMap.data.position) },
					mapType: defaultMapType
				};
				mapsList.push(mapStateCopy);
			}
		});
		mapsListChange = { mapsList };

		/* activeMapId */
		const notExist = !mapsList.some(({ id }) => id === oldActiveMapId);
		if (notExist) {
			mapsList[mapsList.length - 1] = activeMap;
		}

		return { ...mapsListChange };
	}

	constructor(protected store: Store<IMapState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
		this.initEmitters();

		imageryCommunicatorService.instanceCreated.subscribe((communicatorIds) => {
			this.store.dispatch(new AddMapInstanceAction(communicatorIds));
		});

		imageryCommunicatorService.instanceRemoved.subscribe((communicatorIds) => {
			this.store.dispatch(new RemoveMapInstanceAction(communicatorIds));
		});

	}

	initEmitters() {
		this.unsubscribeAll();

		this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator): void => {

			this._subscribers.push(communicator.positionChanged.subscribe(this.positionChanged.bind(this)));
			this._subscribers.push(communicator.singleClick.subscribe(this.singleClick.bind(this)));
			this._subscribers.push(communicator.contextMenu.subscribe(this.contextMenu.bind(this)));

			communicator.getAllVisualizers().forEach((visualizer: IMapVisualizer) => {
				this._subscribers.push(visualizer.onHoverFeature.subscribe(this.hoverFeature.bind(this)));
				this._subscribers.push(visualizer.doubleClickFeature.subscribe(this.dbclickFeature.bind(this)));

				if (visualizer.events.has('drawEndPublisher')) {
					this._subscribers.push(visualizer.events.get('drawEndPublisher').subscribe(this.drawEndSubscriber.bind(this)));
				}

				if (visualizer.events.has('annotationContextMenuHandler')) {
					this._subscribers.push(visualizer.events.get('annotationContextMenuHandler').subscribe(this.annotationContextMenuHandlerSubscriber.bind(this)));
				}
			});

			this._subscribers.push(communicator.mapInstanceChanged.subscribe(this.onActiveMapChanged.bind(this)));
		});

	}

	// TODO: this is a patch that will be removed when "pinpoint" and "pinLocation" will become plugins
	onActiveMapChanged($event: { id: string, oldMapInstanceName: string, newMapInstanceName: string }) {
		const args = {
			oldMapInstanceName: $event.oldMapInstanceName,
			newMapInstanceName: $event.newMapInstanceName,
			currentCommunicatorId: $event.id,
			communicatorIds: this.imageryCommunicatorService.initializedCommunicators
		};
		this.store.dispatch(new MapInstanceChangedAction(args));
	}

	unsubscribeAll() {
		this._subscribers.forEach((subscriber) => subscriber.unsubscribe());
		this._subscribers = [];
	}

	positionChanged($event: { id: string, position: Position }) {
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

	drawEndSubscriber(event) {

		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: 'saveDrawing',
			maps: 'active'
		}));

		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: 'refreshDrawing',
			maps: 'others'
		}));
	}

	annotationContextMenuHandlerSubscriber(payload) {
		this.store.dispatch(new AnnotationContextMenuTriggerAction(payload));
	}


}
