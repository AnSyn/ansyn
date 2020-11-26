import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import { ICasesState, selectCaseById, selectSelectedCase } from '../../reducers/cases.reducer';
import { CloseModalAction, LogRenameCase, SaveCaseAsAction, UpdateCaseAction } from '../../actions/cases.actions';
import { CasesService } from '../../services/cases.service';
import { take, tap } from 'rxjs/operators';
import { cloneDeep } from '../../../../core/utils/rxjs/operators/cloneDeep';
import { ICase } from '../../models/case.model';
import { UUID } from 'angular2-uuid';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';

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

	constructor(protected store: Store<ICasesState>,
				protected casesService: CasesService) {
	}

	@AutoSubscription
	caseName$ = () => this.store.pipe(
		select(selectCaseById(this.caseId)),
		tap( (_case) => {
			this.caseName = _case ? _case.name : new Date().toLocaleString();
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

	ngOnInit(): void {
	}

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
				this.store.dispatch(new LogRenameCase({ oldName: oldName, newName: _case.name }));
				this.store.dispatch(new UpdateCaseAction({ updatedCase: _case, forceUpdate: true }));
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

