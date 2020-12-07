import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { ICasesState, selectCaseById, selectSelectedCase } from '../../reducers/cases.reducer';
import { CloseModalAction, RenameCaseAction, SaveCaseAsAction, UpdateCaseAction } from '../../actions/cases.actions';
import { CasesService } from '../../services/cases.service';
import { take, tap } from 'rxjs/operators';
import { cloneDeep } from '../../../../core/utils/rxjs/operators/cloneDeep';
import { ICase } from '../../models/case.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, -100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }))])
	])
];

@Component({
	selector: 'ansyn-save-case',
	templateUrl: './save-case.component.html',
	styleUrls: ['./save-case.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations
})
@AutoSubscriptions()
export class SaveCaseComponent implements OnInit, OnDestroy {
	@Input() caseId: string;
	caseName: string;

	@HostBinding('@modalContent')
	get modalContent() {
		return true;
	};

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		protected store: Store<ICasesState>,
		protected casesService: CasesService,
		protected translateService: TranslateService
	) {
	}

	@AutoSubscription
	caseName$ = () => this.store.pipe(
		select(selectCaseById(this.caseId)),
		tap( (_case) => {
			this.caseName = _case ? _case.name : moment(new Date()).format('DD/MM/YYYY HH:mm:ss').toLocaleString();
		})
	);


	private cloneDeepOneTime(selector) {
		return this.store.pipe(
			select(selector),
			take(1),
			cloneDeep()
		)
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	saveNewCase() {
		return this.cloneDeepOneTime(selectSelectedCase).pipe(
			tap((selectedCase: ICase) => {
				this.store.dispatch(new SaveCaseAsAction({ ...selectedCase, name: this.caseName }));
			})
		)
	}

	renameCase() {
		return this.cloneDeepOneTime(selectCaseById(this.caseId)).pipe(
			tap( (_case: ICase) => {
				const oldName = _case.name;
				_case.name = this.caseName;
				this.store.dispatch(new RenameCaseAction({case: _case, oldName: oldName, newName: _case.name }));
			})
		)
	}
	onSubmitCase() {
		const obs = this.caseId ? this.renameCase() : this.saveNewCase();
		obs.pipe(
			tap(this.close.bind(this))
		).subscribe()
	}
}

