import { Component, OnDestroy, OnInit } from '@angular/core';
import { TasksService } from '../../services/tasks.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/index';
import { select, Store } from '@ngrx/store';
import { ICaseMapState, IOverlay, selectFavoriteOverlays } from '@ansyn/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/internal/operators';
import {
	AlgorithmTask,
	AlgorithmTaskStatus,
	AlgorithmTaskWhichOverlays,
	IAlgorithmConfig
} from '../../models/tasks.model';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { RunTaskAction, SetTaskDrawIndicator, SetTaskRegionLength } from '../../actions/tasks.actions';
import { selectAlgorithmTaskRegion } from '../../reducers/tasks.reducer';
import { MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { ToggleIsPinnedAction } from '@ansyn/menu';

@Component({
	selector: 'ansyn-tasks-form',
	templateUrl: './tasks-form.component.html',
	styleUrls: ['./tasks-form.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class TasksFormComponent implements OnInit, OnDestroy {
	task: AlgorithmTask = new AlgorithmTask();
	taskStatus: AlgorithmTaskStatus = 'New';
	whichOverlays: AlgorithmTaskWhichOverlays = 'favorite_overlays';
	algNames: string[] = [];
	errorMsg = '';
	MIN_NUM_OF_OVERLAYS = 2;

	get algorithms(): { [alg: string]: IAlgorithmConfig } {
		return this.tasksService.config.algorithms;
	}

	get algorithmConfig(): IAlgorithmConfig {
		return this.algorithms[this.task.type];
	}

	get timeEstimation(): number {
		return this.algorithmConfig.timeEstimationPerOverlayInMinutes * this.task.state.overlays.length;
	}

	@AutoSubscription
	getOverlays$: Observable<IOverlay[]> = this.store$.select(selectFavoriteOverlays).pipe(
		map((overlays: IOverlay[]) => {
			const result = this.task.type
				? overlays.filter((overlay: IOverlay) => {
					return this.algorithmConfig.sensorNames.includes(overlay.sensorName)
				})
				: overlays;
			return result;
		}),
		tap((overlays: IOverlay[]) => {
				this.task.state.overlays = overlays || [];
				this.checkForErrors();
			}
		));

	@AutoSubscription
	activeOverlay$: Observable<IOverlay> = this.store$.pipe(
		select(mapStateSelector),
		filter(Boolean),
		map(MapFacadeService.activeMap),
		filter(Boolean),
		map((map: ICaseMapState) => map.data.overlay),
		distinctUntilChanged(),
		tap((overlay: IOverlay) => {
			this.task.state.masterOverlay = overlay;
			this.checkForErrors();
		})
	);

	@AutoSubscription
	getRegion$: Observable<any[]> = this.store$.select(selectAlgorithmTaskRegion).pipe(
		tap((region) => {
				this.task.state.region = region;
				this.checkForErrors();
			}
		));

	constructor(
		public tasksService: TasksService,
		public translate: TranslateService,
		protected store$: Store<any>
	) {
	}

	ngOnInit() {
		this.algNames = Object.keys(this.algorithms);
	}

	ngOnDestroy(): void {
	}

	onAlgorithmChange() {
		this.store$.dispatch(new SetTaskRegionLength(this.algorithmConfig.regionLengthInMeters));
		this.checkForErrors();
	}

	checkForErrors() {
		let message = '';
		if (this.algorithmConfig && this.task.state.overlays.length < this.MIN_NUM_OF_OVERLAYS) {
			message = `The number of selected overlays ${this.task.state.overlays.length} should be at least ${this.MIN_NUM_OF_OVERLAYS}`;
		} else if (this.algorithmConfig && this.task.state.overlays.length > this.algorithmConfig.maxOverlays) {
			message = `The number of selected overlays ${this.task.state.overlays.length} should be at most ${this.algorithmConfig.maxOverlays}`;
		} else if (!this.task.state.masterOverlay) {
			message = 'No master overlay selected'
		}
		this.showError(message);
	}

	showError(msg: string) {
		this.errorMsg = msg;
	}

	hasError(): boolean {
		return Boolean(this.errorMsg);
	}

	onSubmit() {
		this.store$.dispatch(new RunTaskAction(this.task));
	}

	startDrawMode() {
		this.store$.dispatch(new ToggleIsPinnedAction(true));
		this.store$.dispatch(new SetTaskDrawIndicator(true));
	}

}
