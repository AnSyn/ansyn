import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, pipe } from 'rxjs';
import { IOverlayDrop } from '../../../../overlays/models/overlay.model';
import { select, Store } from '@ngrx/store';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	selectDropMarkup,
	selectDropsWithoutSpecialObjects
} from '../../../../overlays/reducers/overlays.reducer';
import { take, tap } from 'rxjs/operators';
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp
} from '../../../../overlays/actions/overlays.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { ExtendMap } from '../../../../overlays/reducers/extendedMap.class';
import { TranslateService } from '@ngx-translate/core';

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
	sortedBy = 'date';
	start = 0;
	end = 15;
	pagination = 15;
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
			sortFn: (a: string, b: string) => this.translateService.instant(a).localeCompare(this.translateService.instant(b))
		},
		{
			headerName: 'Type',
			headerData: 'icon',
			isAscending: true,
			sortFn: (a, b) => a.localeCompare(b)
		}
	];
	overlayIds: string[];

	@ViewChild('table') table: ElementRef;

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
			select(selectDropsWithoutSpecialObjects),
			tap((overlays: IOverlayDrop[]) => {
				this.resetSort();
				this.overlays = overlays;
			})
		);

	@AutoSubscription
	scrollToActiveMapOverlay$: Observable<any> = this.store$
		.pipe(
			take(1),
			select(selectDropMarkup),
			tap((value: ExtendMap<MarkUpClass, IMarkUpData>) => {
				const [activeMapOverlayId] = value.get(MarkUpClass.active).overlaysIds;
				if (activeMapOverlayId) {
					const indexOfRecentOverlay = this.findIndexBytOverlay(activeMapOverlayId);
					this.updatePaginationOnScroll(indexOfRecentOverlay);
					this.scroll(indexOfRecentOverlay);
				}
			})
		);


	constructor(protected store$: Store<IOverlaysState>,
				protected translateService: TranslateService) {
	}

	findIndexBytOverlay(latestSelectedOverlay: string): number {
		const recentOverlayIndex = this.overlays.map(overlay => overlay.id).indexOf(latestSelectedOverlay);
		return recentOverlayIndex;
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	resetSort(): void {
		this.tableHeaders.forEach(tableHeader => {
			tableHeader.isAscending = true;
		});
	}

	scroll(index: number): void {
		requestAnimationFrame(() => {
			const heightOfRow = document.getElementsByClassName('results-table-body-row-data')[0].clientHeight;
			const amountOfRowsDisplayed = this.table.nativeElement.offsetHeight / heightOfRow;
			this.table.nativeElement.scrollTo(0, (index * heightOfRow) - (amountOfRowsDisplayed / 2) * heightOfRow);
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
			customOverviewElement: $event.currentTarget
		}));
	}

	onMouseOut(): void {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	openOverlay(id: string): void {
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
