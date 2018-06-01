import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { UpdateStatusFlagsAction } from '../../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { selectLayout } from '@ansyn/core/reducers/core.reducer';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { BackToWorldView } from '@ansyn/core/actions/core.actions';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit, OnDestroy {
	@Input() selectedCaseName: string;
	@Input() activeMap: CaseMapState;
	layout$: Observable<LayoutKey> = this.store.select(selectLayout)
		.do((layout) => this.layout = layout);
	layout: LayoutKey;
	private subscribers = [];

	get hideOverlay(): boolean {
		return layoutOptions.get(this.layout).mapsCount > 1;
	}

	constructor(public store: Store<IStatusBarState>) {
	}

	ngOnInit(): void {
		this.store.dispatch(new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.geoFilterIndicator,
			value: true
		}));

		this.subscribers.push(this.layout$.subscribe());
	}

	ngOnDestroy(): void {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	clickBackToWorldView(): void {
		this.store.dispatch(new BackToWorldView({ mapId: this.activeMap.id }));
	}
}
