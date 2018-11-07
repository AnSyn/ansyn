import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlgorithmsService } from '../../services/algorithms.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/index';
import { select, Store } from '@ngrx/store';
import { ICaseMapState, IOverlay, selectFavoriteOverlays } from '@ansyn/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/internal/operators';
import { IAlgorithmsConfig, WhichOverlays } from '../../models/algorithms.model';
import { MapFacadeService, mapStateSelector } from '../../../../map-facade/public_api';
import { filter, map } from 'rxjs/operators';

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
	taskName: string;
	taskStatus: 'New' | 'Sent' = 'New';
	algName: string;
	whichOverlays: WhichOverlays = 'favorite_overlays';
	algNames: string[] = [];
	overlays = ['a', 'b', 'c'];
	errorMsg = '';
	MIN_NUM_OF_OVERLAYS = 2;
	activeOverlay: IOverlay;

	get algorithms() {
		return this.algorithmsService.config;
	}

	get currentAlgorithm(): IAlgorithmsConfig {
		return this.algorithms[this.algName];
	}

	get timeEstimation() {
		return this.currentAlgorithm.timeEstimationPerOverlayInMinutes * this.overlays.length;
	}

	@AutoSubscription
	getOverlays$: Observable<any[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
				this.overlays = favoriteOverlays;
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
		tap((overlay: IOverlay) => {
			this.activeOverlay = overlay;
			this.checkForErrors();
		})
	);

	constructor(
		protected algorithmsService: AlgorithmsService,
		public translate: TranslateService,
		protected store$: Store<any>
	) {
	}

	ngOnInit() {
		console.log(this.algorithms);
		this.algNames = Object.keys(this.algorithms);
	}

	checkForErrors() {
		let message = '';
		if (this.overlays.length < this.MIN_NUM_OF_OVERLAYS) {
			message = `The number of selected overlays is less than ${this.MIN_NUM_OF_OVERLAYS}`;
		} else if (this.currentAlgorithm && this.overlays.length > this.currentAlgorithm.maxOverlays) {
			message = `The number of selected overlays is more than ${this.currentAlgorithm.maxOverlays}`;
		} else if (!this.activeOverlay) {
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
	}

	ngOnDestroy(): void {
	}

}
