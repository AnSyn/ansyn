import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { Store } from '@ngrx/store';
import {
	CopyCaseLinkAction,
	LoadCasesAction,
	OpenModalAction,
	SelectCaseByIdAction
} from '../../actions/cases.actions';
import { CasesEffects } from '../../effects/cases.effects';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '../../reducers/cases.reducer';
import { Case } from '../../models/case.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { isEqual, range as _range } from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])

	])
];


@Component({
	selector: 'ansyn-cases-table',
	templateUrl: './cases-table.component.html',
	styleUrls: ['./cases-table.component.less'],
	animations
})
export class CasesTableComponent implements OnInit {
	@ViewChild('tbody_element') tbody_element: ElementRef;

	cases_from_state$: Observable<Case[]> = this.store
		.select('cases')
		.map((state: ICasesState) => state.cases)
		.distinctUntilChanged(isEqual);

	modalCaseId$: Observable<string> = this.store
		.select('cases')
		.map((state: ICasesState) => state.modalCaseId)
		.distinctUntilChanged(isEqual);

	selectedCaseId$: Observable<string> = this.store
		.select('cases')
		.map((state: ICasesState) => state.selectedCase ? state.selectedCase.id : null)
		.distinctUntilChanged(isEqual);

	get _range() {
		return _range;
	}

	cases_from_state: Case[];
	modalCaseId: string;
	selectedCaseId: string;

	constructor(private store: Store<ICasesState>, private casesEffects: CasesEffects) {
		this.casesEffects.addCaseSuccess$.subscribe(this.onCasesAdded.bind(this));
	}

	ngOnInit(): void {

		this.cases_from_state$.subscribe((_cases_from_state) => {
			this.cases_from_state = _cases_from_state;
		});

		this.modalCaseId$.subscribe((_modalCaseId) => {
			this.modalCaseId = _modalCaseId;
		});

		this.selectedCaseId$.subscribe((_selectedCaseId) => {
			this.selectedCaseId = _selectedCaseId;
		});

		this.loadCases();
	}

	loadCases() {
		this.store.dispatch(new LoadCasesAction());
	}

	onCasesAdded() {
		if (this.tbody_element) {
			this.tbody_element.nativeElement.scrollTop = 0;
		}
	}

	calcTopCaseMenu($event: MouseEvent, case_menu: HTMLDivElement) {
		let target: HTMLElement = <any> $event.target;
		let offsetTop = target.offsetTop;
		let scrollTop = target.parentElement.scrollTop;
		case_menu.style.top = `${offsetTop - scrollTop}px`;
	}

	removeCase($event: MouseEvent, case_id: string): void {
		$event.stopPropagation();
		let component = DeleteCaseComponent;
		this.store.dispatch(new OpenModalAction({ component, case_id }));
	}

	editCase($event: MouseEvent, case_id: string) {
		$event.stopPropagation();
		let component = EditCaseComponent;
		this.store.dispatch(new OpenModalAction({ component, case_id }));
	}

	shareCase($event: MouseEvent, case_id: string) {
		$event.stopPropagation();
		this.store.dispatch(new CopyCaseLinkAction(case_id));
	}

	selectCase(id: string): void {
		this.store.dispatch(new SelectCaseByIdAction(id));
	}

}
