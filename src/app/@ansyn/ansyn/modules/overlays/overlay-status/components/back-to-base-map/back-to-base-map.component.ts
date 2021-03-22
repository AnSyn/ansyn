import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, selectOverlayByMapId, selectFourViewsMode, SetFourViewsModeAction } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { BackToWorldView } from '../../actions/overlay-status.actions';
import { Observable } from 'rxjs';
import { selectIsPinned } from '@ansyn/menu';

@Component({
	selector: 'ansyn-back-to-base-map',
	templateUrl: './back-to-base-map.component.html',
	styleUrls: ['./back-to-base-map.component.less']
})
@AutoSubscriptions()
export class BackToBaseMapComponent implements OnInit, OnDestroy, IEntryComponent {
	static showLast = true;
	@Input() mapId: string;
	overlay: any;
	isPinned: boolean;
	isFourViewsMode: boolean;
	activeMapID: string;

	@AutoSubscription
	isFourViewsMode$ = this.store$.select(selectFourViewsMode).pipe(
		tap(isFourViewsMode => this.isFourViewsMode = isFourViewsMode)
	);

	@AutoSubscription
	isPinned$: Observable<boolean> = this.store$.pipe(
		select(selectIsPinned),
		tap(isPinned => this.isPinned = isPinned)
	);

	constructor(
		protected store$: Store<any>
	) {
	}

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap(overlay => this.overlay = overlay)
	);

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	getType(): string {
		return 'buttons';
	}

	backToWorldView() {
		if (this.isFourViewsMode) {
			this.store$.dispatch(new SetFourViewsModeAction({ active: false }));

		} else {
			this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }));
		}

	}
}
