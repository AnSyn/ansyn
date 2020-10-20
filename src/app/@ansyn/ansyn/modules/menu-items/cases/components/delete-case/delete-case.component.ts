import { Component, EventEmitter, HostBinding, OnInit, Output, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { CasesService } from '../../services/cases.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ICasePreview } from '../../models/case.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';

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

	@AutoSubscription
	activeCase$ = this.store.select(casesStateSelector).pipe(
		map((cases) => cases.entities[cases.modal.id]),
	tap( (activeCase) => this.activeCase = activeCase)
);

	activeCase: ICasePreview;

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
