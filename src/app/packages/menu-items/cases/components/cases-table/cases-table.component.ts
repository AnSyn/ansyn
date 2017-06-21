import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DeleteCaseComponent } from '../delete-case/delete-case.component';
import { EditCaseComponent } from '../edit-case/edit-case.component';
import { Store } from '@ngrx/store';
import {
	LoadCasesAction, OpenModalAction, SelectCaseByIdAction,
	ShareCaseLinkAction
} from '../../actions/cases.actions';
import { CasesEffects } from '../../effects/cases.effects';
import { Observable } from 'rxjs';
import { ICasesState } from '../../reducers/cases.reducer';
import { Case } from '../../models/case.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { isEqual } from 'lodash';

const animations: any[] = [
	trigger("leaveAnim", [
		transition(":leave", [style({boxShadow: 'inset 382px 0 0 0 rgb(206, 120, 128)'}), animate("0.3s", style({boxShadow: 'inset 0px 0px 0px 0px rgb(206, 120, 128)', color: 'white'}))]),
	])
];

@Component({
	selector: 'ansyn-cases-table',
	templateUrl: './cases-table.component.html',
	styleUrls: ['./cases-table.component.less'],
	animations
})
export class CasesTableComponent implements OnInit{
	@ViewChild("tbody_element") tbody_element: ElementRef;

	cases_from_state$: Observable <Case[]> = this.store
			.select("cases")
			.map((state: ICasesState ) => state.cases)
			.distinctUntilChanged(isEqual);

	active_case_id$: Observable <string> = this.store
			.select("cases")
			.map((state: ICasesState ) => state.active_case_id)
			.distinctUntilChanged(isEqual);

	selected_case_id$: Observable <string> = this.store
			.select("cases")
			.map((state: ICasesState ) => state.selected_case ? state.selected_case.id: null)
			.distinctUntilChanged(isEqual);

	cases_from_state: Case[];
	active_case_id: string;
	selected_case_id: string;

	constructor(private store: Store<ICasesState>, private casesEffects: CasesEffects) {
		this.casesEffects.addCaseSuccess$.subscribe(this.onCasesAdded.bind(this));
	}

	ngOnInit(): void {

		this.cases_from_state$.subscribe((_cases_from_state) => {
			this.cases_from_state = _cases_from_state;
		});

		this.active_case_id$.subscribe((_active_case_id) => {
			this.active_case_id = _active_case_id;
		});

		this.selected_case_id$.subscribe((_selected_case_id) => {
			this.selected_case_id = _selected_case_id;
		});

		this.loadCases();
	}

	loadCases() {
		this.store.dispatch(new LoadCasesAction());
	}

	onCasesAdded() {
		this.tbody_element.nativeElement.scrollTop = 0;
	}

	calcTopCaseMenu($event:MouseEvent, case_menu: HTMLDivElement) {
		let target:HTMLElement = <any> $event.target;
		let offsetTop = target.offsetTop;
		let scrollTop = target.parentElement.scrollTop;
		case_menu.style.top = `${offsetTop - scrollTop}px`;
	}

	removeCase($event: MouseEvent, case_id: string): void {
		$event.stopPropagation();
		let component = DeleteCaseComponent;
		this.store.dispatch(new OpenModalAction({component, case_id}));
	}

	editCase($event: MouseEvent, case_id: string){
		$event.stopPropagation();
		let component = EditCaseComponent;
		this.store.dispatch(new OpenModalAction({component, case_id}));
	}

	shareCase($event: MouseEvent, case_id: string){
		$event.stopPropagation();
		this.store.dispatch(new ShareCaseLinkAction(case_id));
	}

	selectCase(id: string): void {
		this.store.dispatch(new SelectCaseByIdAction(id));
	}

}
