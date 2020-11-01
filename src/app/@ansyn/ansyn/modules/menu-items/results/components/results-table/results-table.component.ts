import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, fromEvent } from 'rxjs';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';
import { select, Store } from '@ngrx/store';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	selectDropMarkup,
	selectDropsDescending
} from '../../../../overlays/reducers/overlays.reducer';
import { take, tap } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp
} from '../../../../overlays/actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';
import { TranslateService } from '@ngx-translate/core';
import { SetBadgeAction } from '@ansyn/menu';

interface ITableHeader {
	headerName: string;
	headerData: string;
	isDescending: boolean;
	sortFn: (a, b) => number;
}

@Component({
	selector: 'ansyn-results-table',
	templateUrl: './results-table.component.html',
	styleUrls: ['./results-table.component.less'],
	animations: [
		trigger('isDescending', [
			state('false', style({
				transform: 'rotate(180deg)',
			})),
			state('true', style({
				transform: 'rotate(0deg)',
			})),
			transition('false <=> true', animate('0.2s'))
		])
	]
})

@AutoSubscriptions()
export class ResultsTableComponent implements OnInit, OnDestroy {
	overlays: IOverlayDrop[] = [];
	sortedBy = 'date';
	start = 0;
	end = 15;
	pagination = 15;
	tableHeaders: ITableHeader[] = [
		{
			headerName: 'Type',
			headerData: 'icon',
			isDescending: true,
			sortFn: (a, b) => a.localeCompare(b)
		},
		{
			headerName: 'Sensor',
			headerData: 'sensorName',
			isDescending: true,
			sortFn: (a: string, b: string) => this.translateService.instant(a).localeCompare(this.translateService.instant(b))
		},
		{
			headerName: 'Date & time',
			headerData: 'date',
			isDescending: true,
			sortFn: (a: number, b: number) => a - b
		}
	];
	overlayIds: string[];

	@ViewChild('table') table: ElementRef;

	@AutoSubscription
	onClickClearBadge$ = fromEvent(window, 'click').pipe(
		tap(() => this.store$.dispatch(new SetBadgeAction({ key: 'Results table', badge: undefined })))
	);

	@AutoSubscription
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, IMarkUpData>> = this.store$
		.pipe(
			select(selectDropMarkup),
			tap((value: ExtendMap<MarkUpClass, IMarkUpData>) => {
				const activeMapData = value.get(MarkUpClass.active);
				const displayedMapData = value.get(MarkUpClass.displayed);
				this.overlayIds = activeMapData.overlaysIds.concat(displayedMapData.overlaysIds);
			})
		);

	@AutoSubscription
	loadOverlays$: Observable<any> = this.store$
		.pipe(
			select(selectDropsDescending),
			tap((overlays: IOverlayDrop[]) => {
				this.resetSort();
				this.overlays = overlays.slice();
			})
		);

	@AutoSubscription
	scrollToActiveMapOverlay$: Observable<any> = this.store$
		.pipe(
			take(1),
			select(selectDropMarkup),
			tap((value: ExtendMap<MarkUpClass, IMarkUpData>) => {
				const [activeMapOverlayId] = value.get(MarkUpClass.active).overlaysIds;
				let overlayIdToScroll: string;
				if (activeMapOverlayId) {
					overlayIdToScroll = activeMapOverlayId;
				} else if (this.overlayIds) {
					overlayIdToScroll = this.overlayIds[this.overlayIds.length - 1];
				}

				const indexOfRecentOverlay = this.findIndexByOverlayId(overlayIdToScroll);
				this.updatePaginationOnScroll(indexOfRecentOverlay);
				this.scrollOverlayToCenter(indexOfRecentOverlay);
			})
		);


	constructor(
		protected store$: Store<IOverlaysState>,
		protected translateService: TranslateService
	) {
	}

	findIndexByOverlayId(overlayId: string): number {
		const overlayIndex = this.overlays.map(({id}) => id).indexOf(overlayId);
		return overlayIndex;
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	resetSort(): void {
		this.tableHeaders.forEach(tableHeader => tableHeader.isDescending = true);
	}

	scrollOverlayToCenter(index: number): void {
		requestAnimationFrame(() => {
			const tableRow = document.getElementsByClassName('results-table-body-row-data').item(0);
			if (tableRow) {
				const rowHeight = tableRow.clientHeight;
				const rowDisplayCount = this.table.nativeElement.offsetHeight / rowHeight;
				this.table.nativeElement.scrollTo(0, (index * rowHeight) - (rowDisplayCount / 2) * rowHeight);
			}
		})
	}

	updatePaginationOnScroll(recentOverlayIndex: number): void {
		this.end = recentOverlayIndex > this.pagination ? recentOverlayIndex + this.pagination : this.end;
	}

	loadResults(): void {
		this.end += this.pagination;
	}

	onMouseOver($event, id: string): void {
		this.store$.dispatch(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			customOverviewElementId: $event.currentTarget.id
		}));
		// Angular 9: Saving in the store dom element id, instead of the dom element itself,
		// because it caused the dom element to become freezed, and this caused a crash
		// in zone.js...
	}

	onMouseOut(): void {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	openOverlay(id: string): void {
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	sortOverlays(header: ITableHeader): void {
		const { headerData, isDescending, sortFn } = header;
		this.sortedBy = headerData;
		this.overlays.sort((a, b) => {
			const dataA = a[headerData];
			const dataB = b[headerData];

			return isDescending ? sortFn(dataA, dataB) : sortFn(dataB, dataA);
		});

		header.isDescending = !header.isDescending;
	}
}
