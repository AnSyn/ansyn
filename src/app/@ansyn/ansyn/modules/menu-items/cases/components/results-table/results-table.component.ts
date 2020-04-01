import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { select, Store } from "@ngrx/store";
import { IOverlaysState, selectOverlays } from "../../../../overlays/reducers/overlays.reducer";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { isEqual } from "lodash";

@Component({
	selector: 'ansyn-results-table',
	templateUrl: './results-table.component.html',
	styleUrls: ['./results-table.component.less']
})
export class ResultsTableComponent implements OnInit {

	overlays = [];

	loadOverlays$: Observable<IOverlay[]> = this.store$
		.pipe(
			select(selectOverlays),
			distinctUntilChanged(isEqual),
			tap((overlays: any) =>
				this.overlays = Object.keys(overlays).map((key, index) => overlays[key])
			));

	constructor(protected store$: Store<IOverlaysState>) {
		this.loadOverlays$.subscribe((overlays) => console.log(overlays));
	}

	ngOnInit() {
	}

	loadResults() {

	}

	getType(overlay: IOverlay) {

	}

	timeFormat(overlayDate: Date) {
		
	}
}
