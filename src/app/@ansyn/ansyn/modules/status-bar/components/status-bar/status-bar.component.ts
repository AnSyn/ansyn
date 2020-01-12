import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { Observable } from 'rxjs';
import { CopySnapshotShareLinkAction } from '../../actions/status-bar.actions';
import { tap } from 'rxjs/operators';
import { LayoutKey, layoutOptions, selectLayout } from '@ansyn/map-facade';
import { IMapSettings } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})

export class StatusBarComponent implements OnInit, OnDestroy {
	icon = 'block-icon icon-status-bar-case';
	@Input() selectedCaseName: string;
	@Input() activeMap: IMapSettings;
	layout$: Observable<LayoutKey> = this.store.select(selectLayout).pipe(
		tap((layout) => this.layout = layout));
	layout: LayoutKey;
	private subscribers = [];

	get hideOverlay(): boolean {
		return layoutOptions.get(this.layout).mapsCount > 1;
	}

	constructor(public store: Store<IStatusBarState>) {
	}

	copyLink(): void {
		this.store.dispatch(CopySnapshotShareLinkAction());
	}

	ngOnInit(): void {
		this.subscribers.push(this.layout$.subscribe());
	}

	ngOnDestroy(): void {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

}
