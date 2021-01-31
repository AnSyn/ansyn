import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ICasesState, selectCaseById, selectModalState, selectMyCasesEntities } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { CasesService } from '../../services/cases.service';
import { of } from 'rxjs';
import { concatMap, map, take, tap, withLatestFrom } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { CasesType } from '../../models/cases-config';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, 100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)' }))])
	])
];

@Component({
	selector: 'ansyn-delete-case',
	templateUrl: './delete-case.component.html',
	styleUrls: ['./delete-case.component.less'],
	animations
})
@AutoSubscriptions()
export class DeleteCaseComponent implements OnInit, OnDestroy {
	@HostBinding('@modalContent') readonly modalContent = true;

	activeCase: ICasePreview;

	@AutoSubscription
	activeCase$ = this.store.pipe(
		select(selectModalState),
		concatMap( (modal) => of(modal).pipe(withLatestFrom(this.store.pipe(select(selectCaseById(modal.id)))))),
		tap(([modal, _case]) => this.activeCase = _case),
	);

	@Output() submitCase = new EventEmitter();

	constructor(
		protected store: Store<ICasesState>,
		protected casesService: CasesService
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitRemove() {
		const {id, name} = this.activeCase;
		this.store.pipe(
			select(selectMyCasesEntities),
			take(1),
			map( (entities) => entities[id] ? CasesType.MyCases : CasesType.MySharedCases),
			tap( (type: CasesType) => {
				this.store.dispatch(new DeleteCaseAction({id, name, type}))
				this.close();
			} )
		).subscribe()
	}

}
