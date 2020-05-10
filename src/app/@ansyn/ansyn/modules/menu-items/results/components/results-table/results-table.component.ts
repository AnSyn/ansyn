import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import { select, Store } from '@ngrx/store';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	selectDropMarkup,
	selectDrops,
	selectFilteredOveralys,
	selectOverlaysArray
} from '../../../../overlays/reducers/overlays.reducer';
import { mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp, SetTotalOverlaysAction,
} from '../../../../overlays/actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';
import {
	selectFavoriteOverlays
} from '../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { selectShowOnlyFavorites } from '../../../../filters/reducer/filters.reducer';

@Component({
	selector: 'ansyn-results-table',
	templateUrl: './results-table.component.html',
	styleUrls: ['./results-table.component.less']
})

@AutoSubscriptions()
export class ResultsTableComponent implements OnInit, OnDestroy {
	overlays = [];
	selectedOverlayId: string;
	tableHeaders = [
		{
			headerName: 'Date & time',
			headerData: 'date',
			isSorted: false
		},
		{
			headerName: 'Sensor',
			headerData: 'sourceType',
			isSorted: false
		},
		{
			headerName: 'Type',
			headerData: 'type',
			isSorted: false
		}
	];

	@AutoSubscription
	dropsMarkUp$: Observable<[ExtendMap<MarkUpClass, IMarkUpData>, any]> = this.store$
		.pipe(
			select(selectDropMarkup),
			withLatestFrom(this.store$.pipe(select(selectDrops))),
			tap(([value]: [ExtendMap<MarkUpClass, IMarkUpData>, any]) => {
				const activeMapData = value.get(MarkUpClass.active);
				this.selectedOverlayId = activeMapData.overlaysIds[0];
			})
		);

	@AutoSubscription
	loadOverlays$ = () => combineLatest(this.store$.select(selectFilteredOveralys),
		this.store$.select(selectFavoriteOverlays),
		this.store$.select(selectOverlaysArray),
		this.store$.select(selectShowOnlyFavorites)).pipe(
		mergeMap(([filteredOverlays, favoriteOverlays, overlays, showOnlyFavorites]: [string[], IOverlay[], IOverlay[], boolean]) => {
			this.overlays = showOnlyFavorites ? favoriteOverlays : this.filterOverlays(overlays, filteredOverlays);
			this.store$.dispatch(new SetTotalOverlaysAction(this.overlays.length));

			return this.overlays;
		})
	);

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	loadResults() {
		// TODO: add infinite scroll functionality when directive is fixed
	}

	filterOverlays(overlays: IOverlay[], filteredOverlays: string[]): IOverlay[] {
		return overlays.filter(overlay => filteredOverlays.includes(overlay.id));
	}


	onMouseOver($event, id: string): void {
		this.store$.dispatch(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			customOverviewElement: $event.currentTarget
		}));
	}

	onMouseOut(): void {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	openOverlay(overlay: IOverlay): void {
		const { id } = overlay;
		this.selectedOverlayId = id;
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	getType(overlay: IOverlay): string {
		return this.isAirplaneOverlay(overlay) ? 'icon icon-matos' : 'icon icon-lavian';
	}

	isAirplaneOverlay(overlay: IOverlay): boolean {
		return overlay && overlay.tag && overlay.tag.properties_list ? Boolean(overlay.tag.properties_list.Leg) : false;
	}

	timeFormat(overlayDate: Date): string {
		return overlayDate.toLocaleString('he-IL', { hour12: false });
	}

	sortOverlays(header): void {
		let { headerData, isSorted } = header;
		this.overlays.sort(function (a, b) {
			const dataA = a[headerData];
			const dataB = b[headerData];
			const result = dataB - dataA;
			return isSorted ? result : result * (-1);
		});

		header.isSorted = !header.isSorted;
	}
}
