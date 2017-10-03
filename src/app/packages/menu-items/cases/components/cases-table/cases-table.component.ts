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
		.select <ICasesState> ('cases')
		.pluck <ICasesState, Case[]> ('cases')
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

	calcTopCaseMenu($event: MouseEvent, caseMenu: HTMLDivElement) {
		let target: HTMLElement = <any> $event.target;
		let offsetTop = target.offsetTop;
		let scrollTop = target.parentElement.scrollTop;
		caseMenu.style.top = `${offsetTop - scrollTop}px`;
	}

	removeCase($event: MouseEvent, caseId: string): void {
		$event.stopPropagation();
		let component = DeleteCaseComponent;
		this.store$.dispatch(new OpenModalAction({ component, caseId }));
	}

	editCase($event: MouseEvent, caseId: string) {
		$event.stopPropagation();
		let component = EditCaseComponent;
		this.store$.dispatch(new OpenModalAction({ component, caseId }));
	}

	shareCase($event: MouseEvent, caseId: string) {
		$event.stopPropagation();
		this.store$.dispatch(new CopyCaseLinkAction(caseId));
	}

	selectCase(id: string): void {
		this.store$.dispatch(new SelectCaseByIdAction(id));
	}

}
