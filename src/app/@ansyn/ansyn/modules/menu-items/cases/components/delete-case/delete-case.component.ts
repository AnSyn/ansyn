import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ICasesState, selectMyCaseEntities, selectModalState } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { CasesService } from '../../services/cases.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, withLatestFrom } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

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
		select(selectMyCaseEntities),
		withLatestFrom(this.store.pipe(select(selectModalState))),
		map(([entities, modal]) => entities[modal.id]),
		tap((activeCase) => this.activeCase = activeCase)
	);

	@Output() submitCase = new EventEmitter();

	constructor(protected store: Store<ICasesState>, protected casesService: CasesService) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitRemove() {
		(<Observable<any>>this.casesService.removeCase(this.activeCase.id))
			.pipe(
				tap(() => {
					const { id, name } = this.activeCase;
					this.store.dispatch(new DeleteCaseAction({ id, name }))
				}),
				catchError(() => of(false)),
				tap(() => this.close())
			)
			.subscribe();
	}

}
