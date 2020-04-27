import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { select, Store } from "@ngrx/store";
import {
	ICustomOrientation,
	IOverlaysState, MarkUpClass,
	selectOverlaysArray
} from "../../../../overlays/reducers/overlays.reducer";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { isEqual } from "lodash";
import {
	DisplayOverlayFromStoreAction,
	SetMarkUp,
} from "../../../../overlays/actions/overlays.actions";
import { SetBadgeAction } from "@ansyn/menu";
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";
import { IStatusBarConfig } from "../../../../status-bar/models/statusBar-config.model";
import { AutoSubscription, AutoSubscriptions } from "auto-subscriptions";

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
			tap((overlays: IOverlay[]) => {
				this.overlays = overlays;
				const badge = this.getBadge();
				this.store$.dispatch(new SetBadgeAction({ key: 'Results table', badge }));
			}));

	@AutoSubscription
	loadOverlaysArray$: Observable<IOverlay[]> = this.store$
		.pipe(
			select(selectOverlaysArray),
			distinctUntilChanged(isEqual),
			tap((overlays: IOverlay[]) => {
				return overlays;
			}));

	constructor(protected store$: Store<IOverlaysState>, @Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
		this.loadOverlays$.subscribe();
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

	loadResults() {

	}

	getBadge() {
		return this.overlays ? this.overlays.length.toString() : '0';
	}

	onMouseOver($event, id: string) {
		const resultsTableLeftBorder = 530;
		const lastRowHeight = 900;
		const resultsTableTopBorder = $event.screenY < lastRowHeight ? 0 : -30;
		const top = $event.screenY + resultsTableTopBorder;
		const customOrientation: ICustomOrientation = {
			top,
			left: resultsTableLeftBorder
		};

		this.store$.dispatch(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			customOrientation
		}));
	}

	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	openOverlay(overlay) {
		const { id } = overlay;
		this.selectedOverlayId = id;
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	getType(overlay: IOverlay): string {
		return "icon icon-lavian"
	}

	timeFormat(overlayDate: Date) {
		return overlayDate.toLocaleString('he-IL', { hour12: false });
	}

	filterOverlays(header) {
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
