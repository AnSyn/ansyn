import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResetRemovedOverlaysIdsAction, SetRemovedOverlaysVisibilityAction } from '../../actions/core.actions';
import { ICoreState, selectRemovedOverlays, selectRemovedOverlaysVisibility } from '../../reducers/core.reducer';
import { Store, select } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, withLatestFrom, filter, map } from 'rxjs/internal/operators';
import { IOverlay } from '../../models/overlay.model';
import { selectOverlaysArray, selectOverlaysMap } from '../../../overlays/reducers/overlays.reducer';
import { ICase } from '../../models/case.model';
import { combineLatest, Observable } from 'rxjs';

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
	removedOverlaysCount$: Observable<any> = combineLatest(this.store.select(selectRemovedOverlays), this.store.select(selectOverlaysMap)).pipe(
		tap(([removedOverlaysIds, overlays]: [string[], Map<string, IOverlay>]) => {
			this.removedOverlaysCount = removedOverlaysIds.filter((removedId) => overlays.has(removedId)).length;
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
