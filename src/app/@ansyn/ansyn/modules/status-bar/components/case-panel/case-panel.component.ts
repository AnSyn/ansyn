import { Component, Inject, Input, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { OverlaysActionTypes, UpdateOverlaysCountAction } from '../../../overlays/actions/overlays.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CopySnapshotShareLinkAction } from '../../actions/status-bar.actions';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { IStatusBarConfig, IToolTipsConfig } from '../../models/statusBar-config.model';
import { StatusBarConfig } from '../../models/statusBar.config';

@Component({
	selector: 'ansyn-case-panel',
	templateUrl: './case-panel.component.html',
	styleUrls: ['./case-panel.component.less']
})
export class CasePanelComponent implements OnInit {
	@Input() caseName: string;

	overlaysCount$: Observable<number> = this.actions$.pipe(
		ofType(OverlaysActionTypes.UPDATE_OVERLAY_COUNT),
		map(({ payload }: UpdateOverlaysCountAction) => payload)
	);
	constructor(protected actions$: Actions,
				protected store$: Store<IStatusBarState>,
				@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig) {
	}

	ngOnInit() {
	}

	copyLink(): void {
		this.store$.dispatch(new CopySnapshotShareLinkAction());
	}

}
