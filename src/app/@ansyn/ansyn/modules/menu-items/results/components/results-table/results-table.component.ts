import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { select, Store } from "@ngrx/store";
import {
	IOverlaysState, MarkUpClass,
	selectOverlays
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

@Component({
	selector: 'ansyn-results-table',
	templateUrl: './results-table.component.html',
	styleUrls: ['./results-table.component.less']
})
export class ResultsTableComponent implements OnInit {

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

	loadOverlays$: Observable<IOverlay[]> = this.store$
		.pipe(
			select(selectOverlays),
			distinctUntilChanged(isEqual),
			tap((overlays: any) => {
				this.overlays = this.mapOverlayObjectToArray(overlays);
				const badge = this.getBadge();
				this.store$.dispatch(new SetBadgeAction({ key: 'Results table', badge }));
			}));

	constructor(protected store$: Store<IOverlaysState>, @Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
		this.loadOverlays$.subscribe();
	}

	ngOnInit() {
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

		this.store$.dispatch(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			top,
			left: resultsTableLeftBorder
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
		return "icon icon-matos"
	}

	mapOverlayObjectToArray(overlays) {
		return Object.keys(overlays).map((key, index) => overlays[key]);
	}

	timeFormat(overlayDate: Date) {
		return overlayDate.toLocaleString('en-GB', { hour12: false });
	}

	filterOverlays(header) {
		let { headerData, isSorted } = header;
		this.overlays.sort(function (a, b) {
			const dataA = a[headerData];
			const dataB = b[headerData];
			const score = dataB - dataA;
			return isSorted ? score : score * (-1);
		});

		header.isSorted = !header.isSorted;
	}
}
