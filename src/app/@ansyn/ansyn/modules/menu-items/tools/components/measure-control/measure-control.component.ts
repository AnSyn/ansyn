import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, selectActiveMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetMeasureDistanceToolState } from '../../actions/tools.actions';
import { selectIsMeasureToolActive, selectIsMeasureToolHidden } from '../../reducers/tools.reducer';

@Component({
	selector: 'ansyn-measure-control',
	templateUrl: './measure-control.component.html',
	styleUrls: ['./measure-control.component.less']
})
@AutoSubscriptions()
export class MeasureControlComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	show: boolean;

	@AutoSubscription
	show$ = combineLatest(this.store$.select(selectIsMeasureToolActive),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectIsMeasureToolHidden)).pipe(
		tap(([isActive, activeMapId, isHidden]) => this.show = isActive && activeMapId === this.mapId && !isHidden)
	);

	constructor(protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	getType(): string {
		return 'container';
	}

	clearMeasure() {
		this.done();
		this.store$.dispatch(new SetMeasureDistanceToolState(true));
	}

	done() {
		this.store$.dispatch(new SetMeasureDistanceToolState(false));
	}
}
