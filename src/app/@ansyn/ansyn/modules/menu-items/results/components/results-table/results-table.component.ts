import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { combineLatest, Observable } from 'rxjs';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';
import { select, Store } from '@ngrx/store';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	selectDropMarkup,
	selectDrops, selectPagination
} from '../../../../overlays/reducers/overlays.reducer';
import { map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp, SetTotalOverlaysAction, UpdatePaginationAction,
} from '../../../../overlays/actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';

interface ITableHeader {
	headerName: string;
	headerData: string;
	isAscending: boolean;
	sortFn: (a, b) => number;
}
@Component({
	selector: 'ansyn-results-table',
	templateUrl: './results-table.component.html',
	styleUrls: ['./results-table.component.less'],
	animations: [
		trigger('isDescending', [
			state('true', style({
				transform: 'rotate(180deg)',
			})),
			state('false', style({
				transform: 'rotate(0deg)',
			})),
			transition('false <=> true', animate('0.2s'))
		])
	]
})

@AutoSubscriptions()
export class ResultsTableComponent implements OnInit, OnDestroy {
	overlays: IOverlayDrop[] = [];
	totalOverlays: IOverlayDrop[] = [];
	selectedOverlayId: string;
	sortedBy  = 'date';
	overlayCount: number;
	tableHeaders: ITableHeader[] = [
		{
			headerName: 'Date & time',
			headerData: 'date',
			isAscending: true,
			sortFn: (a: number, b: number) => a - b
		},
		{
			headerName: 'Sensor',
			headerData: 'sensorName',
			isAscending: true,
			sortFn: (a: string, b: string) => a.localeCompare(b)
		},
		{
			headerName: 'Type',
			headerData: 'type',
			isAscending: true,
			sortFn: (a, b) => 0
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
	loadOverlays$: Observable<any> = this.store$
		.pipe(
			select(selectDrops),
			map((overlays: IOverlayDrop[]) => {
				this.totalOverlays = overlays;
				this.overlayCount = overlays.length;
				this.store$.dispatch(new SetTotalOverlaysAction(this.overlayCount));
			})
		);

	@AutoSubscription
	paginateOverlays$: Observable<any> = this.store$
		.pipe(
			select(selectPagination),
			map((pagination: number) => {
				this.overlays = this.totalOverlays.slice(0, pagination);
			})
		);

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	loadResults() {
		this.store$.dispatch(new UpdatePaginationAction());
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

	openOverlay(overlay: IOverlayDrop): void {
		const { id } = overlay;
		this.selectedOverlayId = id;

		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	getType(overlay: IOverlayDrop): string {
		return this.isAirplaneOverlay(overlay) ? 'icon icon-matos' : 'icon icon-lavian';
	}

	isAirplaneOverlay(overlay: IOverlayDrop): boolean {
		return overlay && overlay.tag && overlay.tag.properties_list ? Boolean(overlay.tag.properties_list.Leg) : false;
	}

	timeFormat(overlayDate: Date): string {
		return overlayDate.toLocaleString('he-IL', { hour12: false });
	}

	sortOverlays(header: ITableHeader): void {
		let { headerData, isAscending, sortFn } = header;
		this.sortedBy = headerData;
		this.overlays.sort(function (a, b) {
			const dataA = a[headerData];
			const dataB = b[headerData];
			return isAscending ? sortFn(dataB, dataA) : sortFn(dataA, dataB);

		});

		header.isAscending = !header.isAscending;
	}
}
