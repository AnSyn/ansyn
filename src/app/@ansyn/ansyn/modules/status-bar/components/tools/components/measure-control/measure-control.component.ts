import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, selectActiveMapId, selectIsMinimalistViewMode, selectMaps } from '@ansyn/map-facade';
import { Store, select } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import {
	ClearActiveInteractionsAction,
	RemoveMeasureAction,
	UpdateMeasureDataOptionsAction,
	UpdateToolsFlags
} from '../../actions/tools.actions';
import { selectIsMeasureToolActive } from '../../reducers/tools.reducer';
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

	@AutoSubscription
	mapMeasures$ = this.store$.pipe(
		select(selectMaps),
		map( (maps) => maps[this.mapId]?.data?.measuresData),
		tap( (measureData) => this.measureData = measureData)
	);

	@AutoSubscription
	show$ = combineLatest([
		this.store$.select(selectIsMeasureToolActive),
		this.store$.select(selectActiveMapId),
		this.store$.select(selectIsMinimalistViewMode)
	]).pipe(
		tap(([isActive, activeMapId, isHidden]) => {
			this.show = isActive && activeMapId === this.mapId && !isHidden;
		})
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
