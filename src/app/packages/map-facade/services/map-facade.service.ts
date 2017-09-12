import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IMapState } from '../reducers/map.reducer';
import { ImageryCommunicatorService, IMapVisualizer } from '@ansyn/imagery';
import {
	AddMapInstacneAction,
	ContextMenuShowAction,
	DbclickFeatureTriggerAction,
	HoverFeatureTriggerAction,
	MapInstanceChangedAction,
	MapSingleClickAction,
	PositionChangedAction,
	RemoveMapInstanceAction
} from '../actions';
import { AnnotationsVisualizer, AnnotationVisualizerType } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { Position, Overlay, CaseMapState, defaultMapType } from '@ansyn/core';
import { range, cloneDeep, last } from 'lodash';
import { UUID } from 'angular2-uuid';

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
		return MapFacadeService.mapById(mapState.mapsData, mapState.activeMapId);
	}

	static mapById(mapsData: CaseMapState[], mapId: string): CaseMapState {
		return mapsData.find(({id}) => id === mapId);
	}


	static setMapsDataChanges(mapsData, activeMapId, layout): {newMapsData: CaseMapState[], newActiveMapId?: string} {
		const newMapsData: CaseMapState[]  = [];
		const activeMap = mapsData.find(({id}) => id === activeMapId);
		range(layout.maps_count).forEach((index) => {
			if (mapsData[index]) {
				newMapsData.push(mapsData[index])
			} else {
				const mapStateCopy: CaseMapState = {id: UUID.UUID(), data:{position: cloneDeep(activeMap.data.position)}, mapType: defaultMapType};
				newMapsData.push(mapStateCopy);
			}
		});
		const notExist = !newMapsData.some(({id}) => id === activeMapId);
		if (notExist) {
			const newActiveMapId = last(newMapsData).id;
			return { newMapsData, newActiveMapId };
		}
		return { newMapsData };
	}

	constructor(private store: Store<IMapState>, private imageryCommunicatorService: ImageryCommunicatorService) {
		this.initEmitters();

		imageryCommunicatorService.instanceCreated.subscribe((communicatorsIds) => {
			this.store.dispatch(new AddMapInstacneAction(communicatorsIds));
		});

		imageryCommunicatorService.instanceRemoved.subscribe((communicatorsIds) => {
			this.store.dispatch(new RemoveMapInstanceAction(communicatorsIds));
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
			});

			this._subscribers.push(communicator.mapInstanceChanged.subscribe(this.onActiveMapChanged.bind(this)));

			const annotationVisualizer = communicator.getVisualizer(AnnotationVisualizerType) as AnnotationsVisualizer;
			this._subscribers.push(annotationVisualizer.drawEndPublisher.subscribe(this.drawEndSubscriber.bind(this)));

		});

	}

	// TODO: this is a patch that will be removed when "pinpoint" and "pinLocation" will become plugins
	onActiveMapChanged($event: { id: string, oldMapInstanceName: string, newMapInstanceName: string }) {
		const args = { ...$event, communicatorsIds: this.imageryCommunicatorService.initiliziedCommunicators };
		this.store.dispatch(new MapInstanceChangedAction(args));
	}

	unsubscribeAll() {
		this._subscribers.forEach((subscriber) => {
			subscriber.unsubscribe();
		});
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

}
