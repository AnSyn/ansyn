import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { CloseModalAction, DeleteCaseAction } from '../../actions/cases.actions';
import { Case } from '../../models/case.model';
import { transition, trigger, style, animate } from '@angular/animations';

const animations_during = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, 100%)'
		}), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)' }))]),
	])
];

const host = {
	'[@modalContent]': 'true',
	'[style.display]': '\'block\'',
	'[style.position]': '\'absolute\'',
	'[style.width]': '\'337px\'',
	'[style.top]': '\'15px\'',
	'[style.left]': '\'30px\''
};

@Component({
	selector: 'ansyn-delete-case',
	templateUrl: './delete-case.component.html',
	styleUrls: ['./delete-case.component.less'],
	outputs: ['submitCase'],
	animations,
	host
})

export class DeleteCaseComponent {

	constructor(private store: Store<ICasesState>) {
	}

	selected_case_name$: Observable<string> = this.store.select('cases').map(this.getActiveCaseName);

	getActiveCaseName(case_state: ICasesState): string {
		let s_case: Case = case_state.cases.find((case_value: Case) => case_value.id == case_state.active_case_id);
		return s_case ? s_case.name : '';
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitRemove() {
		this.store.dispatch(new DeleteCaseAction());
		this.close();
	}

}
