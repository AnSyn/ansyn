import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/fromPromise';

export {
	initialMapState,
	mapFeatureKey,
	MapReducer,
	IMapState,
	mapStateSelector,
	selectActiveMapId,
	selectMapsList
} from './reducers/map.reducer';

export {
	AnnotationRemoveFeature,
	AnnotationSelectAction,
	AnnotationUpdateFeature,
	ImageryCreatedAction,
	PinLocationModeTriggerAction,
	RemovePendingOverlayAction,
	SetIsLoadingAcion,
	SetIsVisibleAcion,
	SetPendingOverlaysAction,
	SetProgressBarAction,
	UpdateMapSizeAction,
	ClickOutsideMap,
	ContextMenuDisplayAction,
	ContextMenuShowAction,
	ContextMenuTriggerAction,
	ShadowMouseProducer,
	ActiveMapChangedAction,
	MapActionTypes
} from './actions/map.actions';
export { MapFacadeService } from './services/map-facade.service';
export { IMapFacadeConfig } from './models/map-config.model';
export { mapFacadeConfig } from './models/map-facade.config';
export { MapFacadeModule } from './map-facade.module';
