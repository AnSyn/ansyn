import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	AfterViewInit,
	ViewChild
} from '@angular/core';
import {
	IEntryComponent,
	selectActiveMapId,
	selectHideLayersOnMap,
	selectOverlayByMapId,
} from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest, Observable} from 'rxjs';
import { tap, map, filter, withLatestFrom } from 'rxjs/operators';
import { GeoRegisteration, IOverlay } from '../models/overlay.model';
import {
	ToggleDraggedModeAction,
	ToggleFavoriteAction,
	SetAutoImageProcessing
} from './actions/overlay-status.actions';
import {
	selectFavoriteOverlays,
	selectTranslationData,
	selectOverlaysImageProcess
} from './reducers/overlay-status.reducer';
import { AnnotationMode } from '@ansyn/ol';
import {
	IOverlayImageProcess,
	IOverlaysImageProcess,
	ITranslationData
} from '../../menu-items/cases/models/case.model';
import { Actions, ofType } from '@ngrx/effects';
import {
	SetAnnotationMode,
	ToolsActionsTypes,
	ClearActiveInteractionsAction
} from '../../status-bar/components/tools/actions/tools.actions';
import { selectSelectedLayersIds, selectLayers } from '../../menu-items/layers-manager/reducers/layers.reducer';
import { ClickOutsideService } from '../../core/click-outside/click-outside.service';
import { TranslateService } from '@ngx-translate/core';
import { OverlayStatusService } from './services/overlay-status.service';
import { ComponentVisibilityService } from '../../../app-providers/component-visibility.service';
import { ComponentVisibilityItems } from '../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-overlay-status',
	templateUrl: './overlay-status.component.html',
	styleUrls: ['./overlay-status.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class OverlayStatusComponent implements OnInit, OnDestroy, IEntryComponent, AfterViewInit {
	// for component
	readonly isAnnotationsShow: boolean;
	@ViewChild('closeElementAnnotation', {static: false}) closeElementAnnotation: ElementRef;
	readonly isFavoritesShow: boolean;
	readonly isImageProcessingShow: boolean;
	//
	@Input() mapId: string;
	isAutoProcessing: boolean;
	isManualProcessingOpen: boolean;
	overlay: IOverlay;
	isActiveMap: boolean;
	favoriteOverlays: IOverlay[];
	overlaysTranslationData: any;
	onClickOutSide$: any;
	isFavorite: boolean;
	favoritesButtonText: string;
	isPreset: boolean;
	isDragged: boolean;
	isImageControlActive = false;
	draggedButtonText: string;
	isLayersVisible: boolean;
	isManualProcessChanged: boolean;

	selectOverlaysImageProcess$ = this.store$.pipe(select(selectOverlaysImageProcess), filter(this.hasOverlay.bind(this)));

	@HostBinding('class.rtl')
	isRtl = 'rtl' === this.translateService.instant('direction');

	@AutoSubscription
	favoriteOverlays$: Observable<any[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
			this.favoriteOverlays = favoriteOverlays;
			this.updateFavoriteStatus();
		})
	);

	@AutoSubscription
	active$ = combineLatest([this.store$.select(selectActiveMapId), this.store$.select(selectTranslationData)]).pipe(
		tap(([activeMapId, overlaysTranslationData]: [string, { [_: string]: ITranslationData }]) => {
			this.isActiveMap = activeMapId === this.mapId;
			this.overlaysTranslationData = overlaysTranslationData;
			this.updateDraggedStatus();
		})
	);


	@AutoSubscription
	annoatationModeChange$: any = this.actions$
		.pipe(
			ofType(ToolsActionsTypes.STORE.SET_ANNOTATION_MODE),
			tap((action: SetAnnotationMode) => {
				const useMapId = action.payload && Boolean(action.payload.mapId);
				if ((!useMapId || (useMapId && action.payload.mapId === this.mapId)) &&
					(Boolean(action.payload) && action.payload.annotationMode !== AnnotationMode.Translate &&
						action.payload.annotationMode !== null)) {
					if (this.isDragged) {
						this.toggleDragged();
					}
				}
			}));

	@AutoSubscription
	manualImageProcessingParams$: Observable<Object> = this.selectOverlaysImageProcess$.pipe(
		map((overlaysImageProcess: IOverlaysImageProcess ) => overlaysImageProcess[this.overlay?.id]?.manuelArgs),
		tap((imageManualProcessArgs) => {
			this.isManualProcessChanged = !!imageManualProcessArgs && !this.overlayStatusService.isDefaultImageProcess(imageManualProcessArgs);
		})
	);

	@AutoSubscription
	onChangeAutoImageProcess$: Observable<IOverlayImageProcess> = this.selectOverlaysImageProcess$.pipe(
		map( (overlaysImageProcess) => overlaysImageProcess[this.overlay?.id]),
		filter(Boolean),
		tap( ({isAuto}: IOverlayImageProcess) => this.isAutoProcessing = !!isAuto )
	);

	constructor(
		protected overlayStatusService: OverlayStatusService,
		public store$: Store<any>,
		protected actions$: Actions,
		protected element: ElementRef,
		protected clickOutsideService: ClickOutsideService,
		protected translateService: TranslateService,
		componentVisibilityService: ComponentVisibilityService
	) {
		this.isPreset = true;
		this.isFavorite = true;
		this.isAnnotationsShow = componentVisibilityService.get(ComponentVisibilityItems.ANNOTATIONS);
		this.isFavoritesShow = componentVisibilityService.get(ComponentVisibilityItems.FAVORITES);
		this.isImageProcessingShow = componentVisibilityService.get(ComponentVisibilityItems.IMAGE_PROCESSING);

	}

	@AutoSubscription
	layersVisibility$ = () => combineLatest([
		this.store$.select(selectSelectedLayersIds),
		this.store$.select(selectHideLayersOnMap(this.mapId)),
		this.store$.select(selectLayers)])
		.pipe(
			map(([selectedLayerIds, areLayersHidden, layers]) => {
				layers = layers.filter((currentLayer) =>
					Boolean(currentLayer.data) &&
					currentLayer.type === "Annotation" &&
					currentLayer.data.features.length > 0 &&
					selectedLayerIds.includes(currentLayer.id));
				return [areLayersHidden, layers];
			}),
			tap(([areLayersHidden, layers]) => {
				this.isLayersVisible = !((Boolean(areLayersHidden)) || (Boolean(layers.length === 0)));
				if (this.isDragged) {
					this.toggleDragged();
				}
			})
		);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		withLatestFrom( this.store$.pipe(select(selectOverlaysImageProcess)), (overlay, overlaysImageProcess) => [overlay, overlaysImageProcess[overlay?.id]]),
		tap(([overlay, overlayImageProcess]) => {
			if (this.isDragged) {
				this.toggleDragged();
			}
			this.overlay = overlay;
			this.onChangeOverlay(overlayImageProcess);
		})
	);

	ngOnInit() {
	}

	ngOnDestroy(): void {
		if (this.isDragged) {
			this.toggleDragged();
		}
		this.onClickOutSide$.unsubscribe();
	}

	hasOverlay() {
		return Boolean(this.overlay);
	}

	onChangeOverlay(imageProcess) {
		this.updateFavoriteStatus();
		this.updateDraggedStatus();
		this.resetImageProcess(imageProcess);
	}

	resetImageProcess(imageProcess) {
		if (this.overlay) {
			this.isManualProcessingOpen = false;
			this.dispatchAutoImageProcess(!!imageProcess?.isAuto);
		}
	}

	updateFavoriteStatus() {
		this.isFavorite = false;
		if (this.overlay && this.favoriteOverlays && this.favoriteOverlays.length > 0) {
			this.isFavorite = this.favoriteOverlays.some(o => o.id === this.overlay.id);
		}
		this.favoritesButtonText = this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
	}

	toggleFavorite() {
		const overlay = this.overlay;
		const { id } = overlay;
		const value = !this.isFavorite;
		this.store$.dispatch(new ToggleFavoriteAction({ value, id, overlay }));
	}

	toggleDragged() {
		this.store$.dispatch(new ToggleDraggedModeAction({
			mapId: this.mapId,
			overlayId: this.overlay.id,
			dragged: !this.isDragged
		}));
		if (this.isDragged) {
			this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetAnnotationMode] }));
		}
	}

	getType(): string {
		return 'buttons';
	}

	private updateDraggedStatus() {
		this.isDragged = false;
		if (this.overlay && this.overlaysTranslationData && this.overlaysTranslationData[this.overlay.id]) {
			this.isDragged = this.overlaysTranslationData[this.overlay.id].dragged;
		}
		this.draggedButtonText = this.isDragged ? 'Stop Drag' : 'Start Drag';
	}

	get noGeoRegistration() {
		if (!this.overlay) {
			return false;
		}
		return this.overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered;
	}

	toggleManualImageProcessing() {
		this.isManualProcessingOpen = !this.isManualProcessingOpen;
		this.dispatchAutoImageProcess();
	}

	toggleAutoImageProcessing() {
		this.dispatchAutoImageProcess(!this.isAutoProcessing);
	}


	private dispatchAutoImageProcess(enable = false) {
		this.store$.dispatch(new SetAutoImageProcessing({overlayId: this.overlay.id, isAuto: enable}));
	}

	ngAfterViewInit(): void {
		this.onClickOutSide$ = this.clickOutsideService.onClickOutside({monitor: this.closeElementAnnotation.nativeElement}).pipe(
			filter(Boolean),
			tap( () => {
				this.isManualProcessingOpen = false;
			})
		).subscribe();
	}

}
