import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
	IEntryComponent,
	selectActiveMapId,
	selectIsMinimalistViewMode,
	selectOverlayByMapId
} from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetMeasureDistanceToolState } from '../../actions/tools.actions';
import { selectIsMeasureToolActive } from '../../reducers/tools.reducer';
import { IOverlay } from '../../../../overlays/models/overlay.model';

@Component({
	selector: 'ansyn-measure-control',
	templateUrl: './measure-control.component.html',
	styleUrls: ['./measure-control.component.less']
})
@AutoSubscriptions()
export class MeasureControlComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	show: boolean;
	currentOverlay: IOverlay = undefined;

	@AutoSubscription
	show$ = () => combineLatest(
		this.store$.select(selectIsMeasureToolActive),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectIsMinimalistViewMode),
		this.store$.select(selectOverlayByMapId(this.mapId))).pipe(
		tap(([isActive, activeMapId, isHidden, overlay]) => {
			const differentOverlay = this.isDifferentOverlay(this.currentOverlay, overlay);
			this.currentOverlay = overlay;
			if (differentOverlay) {
				this.done();
			}
			this.show = isActive && activeMapId === this.mapId && !isHidden;
		})
	);

	private isDifferentOverlay(currentOverlay: IOverlay, overlay: IOverlay) {
		if (!Boolean(currentOverlay) && !Boolean(overlay)) {
			return false;
		}

		if (!Boolean(currentOverlay) || !Boolean(overlay)) {
			return true;
		}

		if (currentOverlay.id === overlay.id) {
			return false;
		}
		return true;
	}

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
