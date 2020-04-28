import { Component, Inject, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { Observable } from "rxjs";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { select, Store } from "@ngrx/store";
import {
	IOverlaysState, MarkUpClass,
	selectOverlaysArray
} from "../../../../overlays/reducers/overlays.reducer";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { isEqual } from "lodash";
import {
	DisplayOverlayFromStoreAction, LoadOverlaysAction,
	SetMarkUp,
} from "../../../../overlays/actions/overlays.actions";
import { SetBadgeAction } from "@ansyn/menu";
import { AutoSubscription, AutoSubscriptions } from "auto-subscriptions";
import { Effect } from '@ngrx/effects';

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
	loadOverlays$: Observable<IOverlay[]> = this.store$
		.pipe(
			select(selectOverlaysArray),
			distinctUntilChanged(isEqual),
			tap((overlays: any) => {
				this.overlays = overlays;
			}));

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
		return "icon icon-lavian"
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
