import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { getTimeFormat } from '@ansyn/core/utils/time';
import { TranslateService } from '@ngx-translate/core';
import { IOverlaysState, MarkUpClass, selectHoveredOverlay } from '../../reducers/overlays.reducer';
import { overlayOverviewComponentConstants } from './overlay-overview.component.const';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '../../actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { configuration } from '../../../../../configuration/configuration';
import { ImageryCommunicatorService } from '../../../imagery/communicator-service/communicator.service';
import { selectActiveMapId } from '../../../map-facade/reducers/map.reducer';
import { areCoordinatesNumeric } from '@ansyn/core/utils/geo';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Observer } from 'rxjs/Observer';
import * as turf from '@turf/turf';
import { ProjectionService } from '../../../imagery/projection-service/projection.service';
import { toDegrees } from '@ansyn/core/utils/math';

@Component({
	selector: 'ansyn-overlay-overview',
	templateUrl: './overlay-overview.component.html',
	styleUrls: ['./overlay-overview.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class OverlayOverviewComponent implements OnInit, OnDestroy {

	protected maxNumberOfRetries = 10;
	protected thresholdDegrees = 0.1;

	public sensorName: string;
	public formattedTime: string;
	public imageSrc: string;
	public overlayId: string;

	public loading = false;
	public errorSrc = configuration.overlays.overlayOverviewFailed;

	public rotation = 0;
	protected topElement = this.el.nativeElement.parentElement;

	public get const() {
		return overlayOverviewComponentConstants;
	}

	mapObject;

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.top.px') top = 0;

	@AutoSubscription
	activeMapId$ = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId) => this.imageryCommunicatorService.provide(activeMapId)),
		filter(Boolean),
		tap((communicator) => {
			this.mapObject = communicator.ActiveMap.mapObject;
		})
	);

	@AutoSubscription
	hoveredOverlay$: Observable<any> = this.store$.pipe(
		select(selectHoveredOverlay),
		filter((overlay: IOverlay) => Boolean(this.mapObject)),
		mergeMap((overlay: IOverlay) => this.getCorrectedNorth().pipe(
			map((north) => {
				console.log(toDegrees(north));
				return [overlay, north];
			})
		)),
		tap(this.onHoveredOverlay.bind(this))
	);

	// Mark the original overlay as un-hovered when mouse leaves
	@HostListener('mouseleave')
	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	constructor(
		public store$: Store<IOverlaysState>,
		protected el: ElementRef,
		protected translate: TranslateService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		protected projectionService: ProjectionService
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	onHoveredOverlay([overlay, north]: [IOverlay, number]) {
		if (overlay) {
			const isNewOverlay = this.overlayId !== overlay.id;
			const isFetchingOverlayData = overlay.thumbnailUrl === this.const.FETCHING_OVERLAY_DATA;
			this.overlayId = overlay.id;
			const hoveredElement: Element = this.topElement.querySelector(`#dropId-${this.overlayId}`);
			if (hoveredElement) {
				const hoveredElementBounds: ClientRect = hoveredElement.getBoundingClientRect();
				this.left = hoveredElementBounds.left - 50;
				this.top = hoveredElementBounds.top;
				this.isHoveringOverDrop = true;

				this.sensorName = overlay.sensorName;
				this.imageSrc = isFetchingOverlayData ? undefined : overlay.thumbnailUrl;
				this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
				this.rotation = north;
				console.log(toDegrees(this.rotation));
				if (isNewOverlay || isFetchingOverlayData) {
					this.startedLoadingImage();
				}
			}
		} else {
			this.isHoveringOverDrop = false;
		}
	}


	getCorrectedNorth(): Observable<number> {
		return this.getProjectedCenters().pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad * -1 ;
			})
		);
	}

	getProjectedCenters(): Observable<Point[]> {
		return Observable.create((observer: Observer<any>) => {
			const size = this.mapObject.getSize();
			const olCenterView = this.mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
			if (!areCoordinatesNumeric(olCenterView)) {
				observer.error('no coordinate for pixel');
			}
			const olCenterViewWithOffset = this.mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);
			if (!areCoordinatesNumeric(olCenterViewWithOffset)) {
				observer.error('no coordinate for pixel');
			}
			observer.next([olCenterView, olCenterViewWithOffset]);
		})
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers));
	}

	projectPoints(coordinates: ol.Coordinate[]): Observable<Point[]> {
		return Observable.forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			return this.projectionService.projectApproximatelyFromProjection(point, 'EPSG:3857');
		}));
	}

	onDblClick() {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: this.overlayId }));
	}

	startedLoadingImage() {
		this.loading = true;
	}

	finishedLoadingImage() {
		this.loading = false;
	}
}
