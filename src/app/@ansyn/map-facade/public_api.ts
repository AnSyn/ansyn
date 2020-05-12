export { GeocoderService } from './services/geocoder.service';

export { ImageryZoomerService } from './services/imagery-zoomer.service';
export { IEd50Notification } from './models/map-config.model';

export { IEntryComponent } from './directives/entry-component.directive';

export {
	initialMapState,
	mapFeatureKey,
	MapReducer,
	IMapState,
	mapStateSelector,
	selectMapsIds,
	selectActiveMapId,
	selectMapsList,
	selectMapsTotal,
	selectMaps,
	selectLayout,
	selectWasWelcomeNotificationShown,
	selectToastMessage,
	selectFooterCollapse,
	selectOverlayByMapId,
	selectMapStateById,
	selectHideLayersOnMap,
	selectOverlaysWithMapIds,
	selectMapPositionByMapId,
	selectMapsStateByIds,
	selectOverlayDisplayModeByMapId,
	selectOverlayOfActiveMap,
	selectIsMinimalistViewMode,
	selectMapTypeById,
	selectSourceTypeById,
	selectMapOrientation
} from './reducers/map.reducer';

export {
	SetMinimalistViewModeAction,
	ImageryCreatedAction,
	ImageryRemovedAction,
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
	PointToRealNorthAction,
	PointToImageOrientationAction,
	MapActionTypes,
	SetActiveMapId,
	SetMapsDataActionStore,
	ChangeImageryMap,
	ChangeImageryMapSuccess,
	UpdateMapAction,
	SetMapPositionByRectAction,
	SetMapPositionByRadiusAction,
	SetToastMessageAction,
	PositionChangedAction,
	ToggleMapLayersAction,
	SetLayoutAction,
	SetLayoutSuccessAction,
	IPendingOverlay,
	ToggleFooter,
	ContextMenuShowAngleFilter,
	IAngleFilterClick,
	ReplaceMainLayer,
	ReplaceMainLayerSuccess,
	ReplaceMainLayerFailed,
	SynchronizeMapsAction
} from './actions/map.actions';

export {
	ImageryStatusActionTypes,
	EnableCopyOriginalOverlayDataAction
} from './actions/imagery-status.actions'

export {
	imageryStatusFeatureKey,
	ImageryStatusReducer,
	imageryStatusStateSelector,
	imageryStatusInitialState
} from './reducers/imagery-status.reducer'

export { copyFromContent } from './utils/clipboard';
export { getTimeFormat, getTimeDiff, getTimeDiffFormat } from './utils/time';

export { ProjectionConverterService, ICoordinatesSystem, IUtmZone } from './services/projection-converter.service';
export { MapFacadeService } from './services/map-facade.service';
export { IMapFacadeConfig } from './models/map-config.model';
export { mapFacadeConfig } from './models/map-facade.config';
export { EntryComponentDirective } from './directives/entry-component.directive';
export { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
export { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
export { MapFacadeModule } from './map-facade.module';


export { LayoutKey, layoutOptions, IMapsLayout } from './models/maps-layout';
