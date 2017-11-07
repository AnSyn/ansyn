import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { Case } from '../../models/case.model';
import { animate, style, transition, trigger } from '@angular/animations';

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

export class DeleteCaseComponent {
	@HostBinding('@modalContent') readonly modalContent = true;

	selectedCaseName$: Observable<string> = this.store.select(casesStateSelector).map(this.getActiveCaseName);

	@Output() submitCase = new EventEmitter();

	// TODO check if this works instead of hosting -Amit
	// @HostBinding('@modalContent') modalContent = true;

	constructor(private store: Store<ICasesState>) {
	}

	getActiveCaseName(caseState: ICasesState): string {
		let sCase: Case = caseState.cases.find((caseValue: Case) => caseValue.id === caseState.modalCaseId);
		return sCase ? sCase.name : '';
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitRemove() {
		this.store.dispatch(new DeleteCaseAction());
		this.close();
	}

}
