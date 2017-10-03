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
	@ViewChild('tbodyElement') tbodyElement: ElementRef;

	cases$: Observable<Case[]> = this.store$
		.select <ICasesState>('cases')
		.pluck <ICasesState, Case[]>('cases')
		.distinctUntilChanged();

	modalCaseId$: Observable<string> = this.store$
		.select('cases')
		.map((state: ICasesState) => state.modalCaseId)
		.distinctUntilChanged(isEqual);

	selectedCaseId$: Observable<string> = this.store$
		.select('cases')
		.map((state: ICasesState) => state.selectedCase ? state.selectedCase.id : null)
		.distinctUntilChanged(isEqual);

	get _range() {
		return _range;
	}

	cases: Case[];
	modalCaseId: string;
	selectedCaseId: string;

	constructor(private store$: Store<ICasesState>, private casesEffects: CasesEffects) {
		this.casesEffects.addCaseSuccess$.subscribe(this.onCasesAdded.bind(this));
	}

	ngOnInit(): void {

		this.cases$.subscribe((cases) => {
			this.cases = cases;
		});

		this.modalCaseId$.subscribe((modalCaseId) => {
			this.modalCaseId = modalCaseId;
		});

		this.selectedCaseId$.subscribe((selectedCaseId) => {
			this.selectedCaseId = selectedCaseId;
		});

		this.loadCases();
	}

	loadCases() {
		this.store$.dispatch(new LoadCasesAction());
	}

	onCasesAdded() {
		if (this.tbodyElement) {
			this.tbodyElement.nativeElement.scrollTop = 0;
		}
	}

	onMouseEnterCaseRow(caseMenu: HTMLDivElement, caseRow: HTMLDivElement, tbodyElement: HTMLDivElement) {
		let offsetTop = caseRow.offsetTop;
		let scrollTop = tbodyElement.scrollTop;
		caseMenu.style.top = `${offsetTop - scrollTop + 1}px`;
		caseRow.classList.add('mouse-enter');
	}

	onMouseLeaveCaseRow(caseRow: HTMLDivElement) {
		caseRow.classList.remove('mouse-enter');
	}

	caseMenuClick($event: MouseEvent, caseRow: HTMLDivElement) {
		caseRow.classList.remove('mouse-enter');
		$event.stopPropagation();
	}

	removeCase(caseId: string): void {
		this.store$.dispatch(new OpenModalAction({ component: DeleteCaseComponent, caseId }));
	}

	editCase(caseId: string) {
		this.store$.dispatch(new OpenModalAction({ component: EditCaseComponent, caseId }));
	}

	shareCase(caseId: string) {
		this.store$.dispatch(new CopyCaseLinkAction(caseId));
	}

	selectCase(caseId: string): void {
		this.store$.dispatch(new SelectCaseByIdAction(caseId));
	}

}
