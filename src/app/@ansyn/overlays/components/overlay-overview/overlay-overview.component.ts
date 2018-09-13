import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { combineLatest, of } from 'rxjs/index';
import { CommunicatorEntity } from '../../../imagery/communicator-service/communicator.entity';
import Map from 'ol/map';
import { catchError } from 'rxjs/internal/operators';

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
	public errorSrc = configuration.overlays.overlayOverviewFailed;

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
		filter(([overlay, comm]: [IOverlay, CommunicatorEntity]) => Boolean(comm)),
		map(([overlay, comm]: [IOverlay, CommunicatorEntity]) => [overlay, comm.ActiveMap.mapObject]),
		mergeMap(([overlay, mapObject]: [IOverlay, Map]) => {
			return this.getCorrectedNorth(mapObject).pipe(
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


	getCorrectedNorth(mapObject: Map): Observable<number> {
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
