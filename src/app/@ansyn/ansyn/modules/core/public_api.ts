export {
	IMultipleOverlaysSourceConfig,
	MultipleOverlaysSourceConfig,
	IDateRange,
	IFiltersList,
	IOverlaysSourceProvider
} from './models/multiple-overlays-source-config';
export { ChangeImageryMap } from './actions/core.actions';
export { FileInputComponent } from './forms/file-input/file-input.component';
export { AnsynFormsModule } from './forms/ansyn-forms.module';
export { forkJoinSafe } from './utils/rxjs/observables/fork-join-safe';
export { mergeArrays } from './utils/merge-arrays';
export { selectTime } from './reducers/core.reducer';
export { ILoggerConfig } from './models/logger-config.model';
export { AnsynTranslationModule } from './translation/ansyn-translation.module';
export { SliderCheckboxComponent } from './forms/slider-checkbox/slider-checkbox.component';
export { MockComponent } from './test/mock-component';
export { createStore, IStoreFixture } from './test/mock-store';
export { AnsynCheckboxComponent } from './forms/ansyn-checkbox/ansyn-checkbox.component';
export { asyncData } from './test/async-observable-helpers';
export { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
export { coreFeatureKey, coreInitialState, CoreReducer } from './reducers/core.reducer';
export { type } from './utils/type';
export { selectAutoSave, selectRemovedOverlays, selectRemovedOverlaysVisibility } from './reducers/core.reducer';
export {
	SetRemovedOverlayIdsCount,
	SetRemovedOverlaysIdAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from './actions/core.actions';
export { InjectionResolverFilter } from './services/generic-type-resolver';
export { GenericTypeResolverService } from './services/generic-type-resolver.service';

export { LoggerConfig } from './models/logger.config';
export { IEntity } from './services/storage/storage.service';
export { coreStateSelector, selectFavoriteOverlays, selectPresetOverlays } from './reducers/core.reducer';
export { ILimitedArray } from './utils/i-limited-array';
export { ClearActiveInteractionsAction } from './actions/core.actions';
export { IStoredEntity, StorageService } from './services/storage/storage.service';
export { AnsynInputComponent } from './forms/ansyn-input/ansyn-input.component';
export { copyFromContent } from './utils/clipboard';
export { ErrorHandlerService } from './services/error-handler.service';
export {
	SetAutoSave,
	SetFavoriteOverlaysAction,
	SetPresetOverlaysAction, SetRemovedOverlaysIdsAction,
	SetRemovedOverlaysVisibilityAction
} from './actions/core.actions';
export { ICoreState } from './reducers/core.reducer';
export { GoNextPresetOverlay } from './actions/core.actions';
export { SetOverlaysCriteriaAction } from './actions/core.actions';
export { LoggerService } from './services/logger.service';
export { selectDataInputFilter, selectOverlaysCriteria, selectRegion } from './reducers/core.reducer';
export {
	CoreActionTypes,
	EnableCopyOriginalOverlayDataAction,
	GoAdjacentOverlay,
	UpdateOverlaysCountAction
} from './actions/core.actions';

export { ICoreConfig } from './models/core.config.model';
export { CoreConfig } from './models/core.config';
export { endTimingLog, startTimingLog } from './utils/logs/timer-logs';
export { buildFilteredOverlays } from './utils/overlays';
export { isFullOverlay } from './utils/overlays';
export { IFilterModel } from './models/IFilterModel';
export { sortByDate, sortByDateDesc } from './utils/sorting';
export { limitArray, mergeLimitedArrays } from './utils/i-limited-array';
export { toDegrees, toRadians } from './utils/math';
export { toastMessages } from './models/toast-messages';
export { ICoordinatesSystem } from './models/coordinate-system.model';
export { cloneDeep } from './utils/rxjs/operators/cloneDeep';
export { rxPreventCrash } from './utils/rxjs/operators/rxPreventCrash';

export { IContext } from './models/context.model';
export { mapValuesToArray } from './utils/misc';
export { CoreModule } from './core.module';
export { DisplayedOverlay } from './models/context.model';

export { ExtentCalculator } from './utils/extent-calculator';
export { BaseFetchService } from './services/base-fetch-service';
export { FetchService } from './services/fetch.service';
export { IDeltaTime } from './models/time.model';

/* @todo: remove contexts actions */
export { AddAllContextsAction, SetContextParamsAction } from './actions/core.actions';
export { selectContextEntities, selectContextsArray } from './reducers/core.reducer';
