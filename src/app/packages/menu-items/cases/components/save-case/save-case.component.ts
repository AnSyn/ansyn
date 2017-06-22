import { Component, HostListener, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Case } from '../../models/case.model';
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { SaveDefaultCaseAction, CloseModalAction } from '../../actions/cases.actions';

const animations_during = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(":enter", [style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(":leave", [style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }))]),
	])
];

const host = {
	"[@modalContent]": "true",
	"[style.display]": "'block'",
	"[style.position]": "'absolute'",
	"[style.width]": "'337px'",
	"[style.top]": "'15px'",
	"[style.left]": "'30px'"
};

@Component({
	selector: 'ansyn-save-case',
	templateUrl: './save-case.component.html',
	styleUrls: ['./save-case.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations,
	host
})
export class SaveCaseComponent implements OnInit {

	selected_case$: Observable<Case> = this.store.select("cases")
		.map(this.getCloneSelectedCase.bind(this));

	case_model: Case;

	@ViewChild("name_input") name_input: ElementRef;

	@HostListener("@modalContent.done") selectText() {
		this.name_input.nativeElement.select();
	}

	constructor(private store: Store<ICasesState>) { }

	getCloneSelectedCase(case_state: ICasesState): Case {
		let s_case: Case = case_state.selected_case;
		return s_case;
	}

	ngOnInit(): void {
		this.selected_case$.subscribe((selected_case: Case) => {
			this.case_model = selected_case;
		});
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase() {
		this.store.dispatch(new SaveDefaultCaseAction(this.case_model));
		close();
	}
}

