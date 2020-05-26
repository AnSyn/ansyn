import { Component, Inject, Input, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { OverlaysActionTypes, UpdateOverlaysCountAction } from '../../../overlays/actions/overlays.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CopySnapshotShareLinkAction } from '../../actions/status-bar.actions';
import { Store, select } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { StatusBarConfig } from '../../models/statusBar.config';
import { ICase } from '../../../menu-items/cases/models/case.model';
import { selectSelectedCase } from '../../../menu-items/cases/reducers/cases.reducer';
import { COMPONENT_MODE } from '../../../../app-providers/component-mode';

@Component({
	selector: 'ansyn-case-panel',
	templateUrl: './case-panel.component.html',
	styleUrls: ['./case-panel.component.less']
})
export class CasePanelComponent implements OnInit {

	overlaysCount$: Observable<number> = this.actions$.pipe(
		ofType(OverlaysActionTypes.UPDATE_OVERLAY_COUNT),
		map(({ payload }: UpdateOverlaysCountAction) => payload)
	);

	selectedCaseName$: Observable<string> = this.store$
		.pipe(
			select(selectSelectedCase),
			map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case')
		);
	constructor(protected actions$: Actions,
				protected store$: Store<IStatusBarState>,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
	}

	ngOnInit() {
	}

	copyLink(): void {
		this.store$.dispatch(new CopySnapshotShareLinkAction());
	}

}
