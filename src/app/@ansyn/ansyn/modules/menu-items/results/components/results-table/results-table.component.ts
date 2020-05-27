import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';
import { select, Store } from '@ngrx/store';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	selectDropMarkup,
	selectDropsWithoutSpecialObjects
} from '../../../../overlays/reducers/overlays.reducer';
import { tap } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp
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
	selectedOverlayId: string;
	sortedBy = 'date';
	start = 0;
	end = 15;
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
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, IMarkUpData>> = this.store$
		.pipe(
			select(selectDropMarkup),
			tap((value: ExtendMap<MarkUpClass, IMarkUpData>) => {
				const activeMapData = value.get(MarkUpClass.active);
				this.selectedOverlayId = activeMapData.overlaysIds[0];
			})
		);

	@AutoSubscription
	loadOverlays$: Observable<any> = this.store$
		.pipe(
			select(selectDropsWithoutSpecialObjects),
			tap((overlays: IOverlayDrop[]) => {
				this.resetSort();
				this.overlays = overlays;
				this.overlayCount = overlays.length;
			})
		);

	constructor(protected store$: Store<IOverlaysState>) {
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	resetSort() {
		this.tableHeaders.forEach(tableHeader => {
			tableHeader.isAscending = true;
		});
	}

	loadResults() {
		const pagination = 15;
		this.end += pagination;
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

	openOverlay(id: string): void {
		this.selectedOverlayId = id;
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
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
