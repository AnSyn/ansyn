export { copyFromContent } from './utils/clipboard';

export { AlertMsgTypes } from './alerts/model';
export { selectMaps } from './reducers/map.reducer';
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
	MapActionTypes,
	SetActiveMapId,
	SetMapsDataActionStore,
	ChangeImageryMap,
	ChangeImageryMapSuccess,
	UpdateMapAction,
	SetMapPositionByRectAction,
	SetMapPositionByRadiusAction,
	AddAlertMsg,
	RemoveAlertMsg,
	SetToastMessageAction
} from './actions/map.actions';

export {
	ImageryStatusActionTypes,
	ToggleFavoriteAction,
	TogglePresetOverlayAction,
	SetRemovedOverlaysIdAction,
	SetFavoriteOverlaysAction,
	SetPresetOverlaysAction,
	SetRemovedOverlaysIdsAction,
	ResetRemovedOverlaysIdsAction,
	SetRemovedOverlaysVisibilityAction,
	EnableCopyOriginalOverlayDataAction,
	SetRemovedOverlayIdsCount
} from './actions/imagery-status.actions'

export {
	selectRemovedOverlaysIdsCount,
	selectFavoriteOverlays,
	selectPresetOverlays,
	selectRemovedOverlays,
	selectRemovedOverlaysVisibility
} from './reducers/imagery-status.reducer'

export { MapFacadeService } from './services/map-facade.service';
export { IMapFacadeConfig } from './models/map-config.model';
export { mapFacadeConfig } from './models/map-facade.config';
export { MapFacadeModule } from './map-facade.module';
export { PositionChangedAction } from './actions/map.actions';

export { AnnotationsColorComponent } from './components/annotations-color/annotations-color.component';
export { AnnotationsWeightComponent } from './components/annotations-weight/annotations-weight.component';
export { ToggleMapLayersAction, SetLayoutAction, SetLayoutSuccessAction } from './actions/map.actions';
export { selectLayout, selectWasWelcomeNotificationShown } from './reducers/map.reducer';
export { BackToWorldSuccess, BackToWorldView } from './actions/map.actions';
export { extentFromGeojson, getFootprintIntersectionRatioInExtent } from './utils/calc-extent';
export { ColorPickerComponent } from './components/color-picker/color-picker.component';
export { AlertsModule } from './alerts/alerts.module';
export { IAlert } from './alerts/alerts.model';
export { IAlertComponent } from './alerts/alerts.model';
export { AlertComponentDirective } from './alerts/alert-component.directive';
export { selectToastMessage } from './reducers/map.reducer';
export { getTimeFormat } from './utils/time';
export { ClickOutsideDirective } from './directives/click-outside.directive';
export { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
export { AnimatedEllipsisComponent } from './components/animated-ellipsis/animated-ellipsis.component';
export { getTimeDiff, getTimeDiffFormat } from './utils/time';
