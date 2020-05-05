import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
import { tap, withLatestFrom } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetFavoriteOverlaysAction,
	SetMarkUp,
} from '../../../../overlays/actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';
import { selectFavoriteOverlays } from '../../../../overlays/overlay-status/reducers/overlay-status.reducer';

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
	loadOverlays$: Observable<[IOverlay[], string[], IOverlay[]]> = this.store$
		.pipe(
			select(selectOverlaysArray),
			withLatestFrom(this.store$.select(selectFilteredOveralys), this.store$.select(selectFavoriteOverlays)),
			tap(([overlays, filteredOverlays, favoriteOverlays]: [IOverlay[], string[], IOverlay[]]) => {

				if (Boolean(favoriteOverlays.length)) {
					this.store$.dispatch(new SetFavoriteOverlaysAction(favoriteOverlays));
					this.overlays = favoriteOverlays;
				} else {
					this.overlays = overlays.filter(overlay => {
						return filteredOverlays.includes(overlay.id);
					});
				}
			}));

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

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	loadResults() {
		// TODO: add infinite scroll functionality when directive is fixed
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
		return 'icon icon-lavian';
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
