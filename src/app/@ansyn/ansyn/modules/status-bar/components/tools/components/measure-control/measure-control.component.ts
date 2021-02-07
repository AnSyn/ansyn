import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, selectActiveMapId, selectIsMinimalistViewMode } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
	ClearActiveInteractionsAction,
	RemoveMeasureAction,
	UpdateMeasureDataOptionsAction,
	UpdateToolsFlags
} from '../../actions/tools.actions';
import { selectIsMeasureToolActive, selectMeasureDataByMapId } from '../../reducers/tools.reducer';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { IMeasureData, toolsFlags } from '../../models/tools.model';

@Component({
	selector: 'ansyn-measure-control',
	templateUrl: './measure-control.component.html',
	styleUrls: ['./measure-control.component.less']
})
@AutoSubscriptions()
export class MeasureControlComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId: string;
	show: boolean;
	measureData: IMeasureData;

	constructor(protected store$: Store<any>) {
	}

	@AutoSubscription
	show$ = () => combineLatest([
		this.store$.select(selectIsMeasureToolActive),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectIsMinimalistViewMode)
		]).pipe(
		tap(([isActive, activeMapId, isHidden]) => {
			this.show = isActive && activeMapId === this.mapId && !isHidden;
		})
	);

	@AutoSubscription
	measureData$ = () => this.store$.select(selectMeasureDataByMapId(this.mapId)).pipe(
		tap((measureData: IMeasureData) => {
			this.measureData = measureData;
		})
	);

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
			options: { isLayerShowed: !this.measureData.isLayerShowed },
			fromUI: true
		}));
	}

	toggleMeasureToolActivation() {
		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [UpdateMeasureDataOptionsAction] }));
		this.store$.dispatch(new UpdateMeasureDataOptionsAction({
			mapId: this.mapId,
			options: {
				isToolActive: !this.measureData.isToolActive,
				isRemoveMeasureModeActive: false,
			},
			fromUI: true
		}));
	}

	toggleRemoveSingleMeasure() {
		this.store$.dispatch(new UpdateMeasureDataOptionsAction({
			mapId: this.mapId,
			options: {
				isRemoveMeasureModeActive: !this.measureData.isRemoveMeasureModeActive,
				isToolActive: false
			},
			fromUI: true
		}));
	}

	clearMeasure() {
		this.store$.dispatch(new RemoveMeasureAction({ mapId: this.mapId }));
	}

	done() {
		this.store$.dispatch(new UpdateToolsFlags([{key: toolsFlags.isMeasureToolActive, value: false}]));
	}
}
