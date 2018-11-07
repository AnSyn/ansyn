import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlgorithmsService } from '../../services/algorithms.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/index';
import { Store } from '@ngrx/store';
import { selectFavoriteOverlays } from '@ansyn/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/internal/operators';
import { WhichOverlays } from '../../models/algorithms.model';

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
	errorMsg: string;

	get algorithms() {
		return this.algorithmsService.config;
	}

	get currentAlgorithm() {
		return this.algorithms[this.algName];
	}

	get timeEstimation() {
		return this.currentAlgorithm.timeEstimationPerOverlayInMinutes * this.overlays.length;
	}

	@AutoSubscription
	getOverlays$: Observable<any[]> = this.store$.select(selectFavoriteOverlays).pipe(
		tap((favoriteOverlays) => {
			this.overlays = favoriteOverlays;
		}
	));

	constructor(
		protected algorithmsService: AlgorithmsService,
		public translate: TranslateService,
		protected store$: Store<any>
	) {
	}

	ngOnInit() {
		this.clearError();
		console.log(this.algorithms);
		this.algNames = Object.keys(this.algorithms);
	}

	clearError() {
		this.errorMsg = '';
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
