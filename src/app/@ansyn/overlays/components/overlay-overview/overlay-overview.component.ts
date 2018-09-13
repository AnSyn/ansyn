import { Component, ElementRef, HostBinding, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { forkJoin, Observable } from 'rxjs';
import { areCoordinatesNumeric, getTimeFormat, IOverlay } from '@ansyn/core';
import { TranslateService } from '@ngx-translate/core';
import { IOverlaysState, MarkUpClass, selectHoveredOverlay } from '../../reducers/overlays.reducer';
import { overlayOverviewComponentConstants } from './overlay-overview.component.const';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '../../actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { OverlaysConfig } from '../../services/overlays.service';
import { IOverlaysConfig } from '../../models/overlays.config';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import { Observer } from 'rxjs/Observer';
import * as turf from '@turf/turf';
import { combineLatest, of } from 'rxjs/index';
import Map from 'ol/map';

/* delete */
import { selectActiveMapId } from '../../../map-facade';
import { ImageryCommunicatorService, CommunicatorEntity, ProjectionService  } from '../../../imagery';

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
	@ViewChild('img') img: ElementRef;

	public sensorName: string;
	public formattedTime: string;
	public overlayId: string;

	public loading = false;
	public errorSrc = this.overlaysConfig.overlayOverviewFailed;

	public rotation = 0;
	protected topElement = this.el.nativeElement.parentElement;

	public get const() {
		return overlayOverviewComponentConstants;
	}

	@HostBinding('class.show') isHoveringOverDrop = false;
	@HostBinding('style.left.px') left = 0;
	@HostBinding('style.top.px') top = 0;

	@AutoSubscription
	hoveredOverlay$: Observable<any> = combineLatest(this.store$.pipe(select(selectHoveredOverlay)), this.store$.pipe(select(selectActiveMapId))).pipe(
		map(([overlay, activeMapId]: [IOverlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)]),
		mergeMap(([overlay, comm]: [IOverlay, CommunicatorEntity]) => {
			return this.getCorrectedNorth(comm).pipe(
				catchError(() => of(0)),
				map((north) => {
					return [overlay, north];
				})
			);
		}),
		tap(this.onHoveredOverlay.bind(this)),
		catchError(() => of(true))
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
		@Inject(OverlaysConfig) protected overlaysConfig: IOverlaysConfig,
		protected projectionService: ProjectionService) {
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
				this.img.nativeElement.src = isFetchingOverlayData ? undefined : overlay.thumbnailUrl;
				this.formattedTime = getTimeFormat(new Date(overlay.photoTime));
				this.rotation = north;
				if ((isNewOverlay || isFetchingOverlayData) && !this.img.nativeElement.complete) {
					this.startedLoadingImage();
				}
			}
		} else {
			this.isHoveringOverDrop = false;
		}
	}


	getCorrectedNorth(communicator: CommunicatorEntity): Observable<number> {
		if (!communicator) {
			return of(0);
		}
		const { mapObject } = communicator.ActiveMap;
		return this.getProjectedCenters(mapObject).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad * -1;
			})
		);
	}

	getProjectedCenters(mapObject: Map): Observable<Point[]> {
		return Observable.create((observer: Observer<any>) => {
			const size = mapObject.getSize();
			const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
			if (!areCoordinatesNumeric(olCenterView)) {
				observer.error('no coordinate for pixel');
			}
			const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);
			if (!areCoordinatesNumeric(olCenterViewWithOffset)) {
				observer.error('no coordinate for pixel');
			}
			observer.next([olCenterView, olCenterViewWithOffset]);
		})
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers));
	}

	projectPoints(coordinates: ol.Coordinate[]): Observable<Point[]> {
		return forkJoin(coordinates.map((coordinate) => {
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
