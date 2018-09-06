import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResetRemovedOverlaysIdsAction, SetRemovedOverlaysVisibilityAction } from '../../actions/core.actions';
import {
	ICoreState,
	selectRemovedOverlaysIdsCount,
	selectRemovedOverlaysVisibility
} from '../../reducers/core.reducer';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-manual-removed-overlays',
	templateUrl: './manual-removed-overlays.component.html',
	styleUrls: ['./manual-removed-overlays.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ManualRemovedOverlaysComponent implements OnInit, OnDestroy {
	removedOverlaysVisibility: boolean;
	removedOverlaysCount = 0;

	@AutoSubscription
	removedOverlaysVisibility$: Observable<any> = this.store.select(selectRemovedOverlaysVisibility).pipe(
		tap((visibility) => {
			this.removedOverlaysVisibility = visibility;
		})
	);

	@AutoSubscription
	removedOverlaysCount$: Observable<any> = this.store.pipe(
		select(selectRemovedOverlaysIdsCount),
		tap((removedOverlaysCount: number) => {
			this.removedOverlaysCount = removedOverlaysCount;
		})
	);

	constructor(protected store: Store<ICoreState>) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	showRemoved() {
		this.store.dispatch(new SetRemovedOverlaysVisibilityAction(!this.removedOverlaysVisibility));
	}

	showAll() {
		this.store.dispatch(new ResetRemovedOverlaysIdsAction());
	}

}
