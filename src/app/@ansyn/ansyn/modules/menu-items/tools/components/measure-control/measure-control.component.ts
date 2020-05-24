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
import {
	ClearActiveInteractionsAction, RemoveMeasureAction,
	SetMeasureDistanceToolState,
	UpdateMeasureDataOptionsAction
} from '../../actions/tools.actions';
import { selectIsMeasureToolActive, selectMeasureDataByMapId } from '../../reducers/tools.reducer';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import { IMeasureData } from '../../models/measure-data';

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
	measureData: IMeasureData;

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

	@AutoSubscription
	measureData$ = () => this.store$.select(selectMeasureDataByMapId(this.mapId)).pipe(
		tap((measureData: IMeasureData) => {
			this.measureData = measureData;
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

	toggleShowLayer() {
		this.store$.dispatch(new UpdateMeasureDataOptionsAction({
			mapId: this.mapId,
			options: { isLayerShowed: !this.measureData.isLayerShowed }
		}));
	}

	toggleMeasureToolActivation() {
		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateMeasureDataOptionsAction] }));
		this.store$.dispatch(new UpdateMeasureDataOptionsAction({
			mapId: this.mapId,
			options: {
				isToolActive: !this.measureData.isToolActive,
				isRemoveMeasureModeActive: false,
			}
		}));
	}

	toggleRemoveSingleMeasure() {
		this.store$.dispatch(new UpdateMeasureDataOptionsAction({
			mapId: this.mapId,
			options: {
				isRemoveMeasureModeActive: !this.measureData.isRemoveMeasureModeActive,
				isToolActive: false
			}
		}));
	}

	clearMeasure() {
		this.store$.dispatch(new RemoveMeasureAction({ mapId: this.mapId }));
	}

	done() {
		this.store$.dispatch(new SetMeasureDistanceToolState(false));
	}
}
