import { Component, Inject, OnInit } from '@angular/core';
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";
import { IStatusBarConfig } from "../../../../status-bar/models/statusBar-config.model";
import { Observable } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { OverlaysActionTypes, UpdateOverlaysCountAction } from "../../../../overlays/actions/overlays.actions";
import { map } from "rxjs/operators";

@Component({
	selector: 'ansyn-results-table-header',
	templateUrl: './results-table-header.component.html',
	styleUrls: ['./results-table-header.component.less']
})
export class ResultsTableHeaderComponent implements OnInit {

	overlaysCount$: Observable<number> = this.actions$.pipe(
		ofType(OverlaysActionTypes.UPDATE_OVERLAY_COUNT),
		map(({ payload }: UpdateOverlaysCountAction) => payload)
	);

	constructor(@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig, protected actions$: Actions) {
	}

	ngOnInit() {
	}

}
