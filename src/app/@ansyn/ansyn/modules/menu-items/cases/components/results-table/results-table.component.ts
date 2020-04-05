import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { select, Store } from "@ngrx/store";
import {
	IOverlaysState, MarkUpClass,
	selectOverlays
} from "../../../../overlays/reducers/overlays.reducer";
import { distinctUntilChanged, pluck, tap } from "rxjs/operators";
import { isEqual } from "lodash";
import { DisplayOverlayFromStoreAction, SetMarkUp } from "../../../../overlays/actions/overlays.actions";

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
			tap((overlays: any) => this.mapOverlayObjectToArray(overlays)));

	constructor(protected store$: Store<IOverlaysState>) {
		this.loadOverlays$.subscribe((overlays) => console.log(overlays));
	}

	ngOnInit() {
	}

	loadResults() {

	}

	onMouseOver(id: string) {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [id] } }));
	}

	onMouseOut() {
		this.store$.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	}

	openOverlay(overlay) {
		const { id } = overlay;
		this.selectedOverlayId = id;
		this.store$.dispatch(new DisplayOverlayFromStoreAction({ id }));
	}

	getType(overlay: IOverlay) {

	}

	mapOverlayObjectToArray(overlays) {
		this.overlays = Object.keys(overlays).map((key, index) => overlays[key]);
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
