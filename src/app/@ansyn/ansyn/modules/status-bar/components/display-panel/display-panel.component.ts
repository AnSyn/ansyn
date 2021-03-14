import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutKey, layoutOptions, selectFourViewsMode, selectLayout, SetLayoutAction } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IStatusBarConfig } from '../../models/statusBar-config.model';
import { CaseOrientation } from '../../../menu-items/cases/models/case.model';

@Component({
	selector: 'ansyn-display-panel',
	templateUrl: './display-panel.component.html',
	styleUrls: ['./display-panel.component.less']
})
@AutoSubscriptions()
export class DisplayPanelComponent implements OnInit, OnDestroy {
	layout: LayoutKey;
	orientation: CaseOrientation;
	fourViewsMode: boolean;

	@AutoSubscription
	layout$: Observable<LayoutKey> = this.store$.select(selectLayout).pipe(
		tap( layout => this.layout = layout)
	);

	@AutoSubscription
	fourViewsMode$ = this.store$.pipe(
		select(selectFourViewsMode),
		tap(fourViewsMode => this.fourViewsMode = fourViewsMode)
	);

	constructor(
		protected store$: Store<IStatusBarState>,
		@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig
	) {
	}

	get layouts(): LayoutKey[] {
		return Array.from(layoutOptions.keys());
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	layoutSelectChange(layout: LayoutKey): void {
		this.store$.dispatch(new SetLayoutAction(layout));
	}

}
