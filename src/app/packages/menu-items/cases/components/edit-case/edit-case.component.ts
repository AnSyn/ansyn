import { Component, HostListener, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { AddCaseAction, CloseModalAction, LoadContextsAction, UpdateCaseAction } from '../../actions/cases.actions';
import * as _ from "lodash";
import { Case } from '../../models/case.model';
import { Context } from '../../models/context.model';
import { defaultMapType } from '../../';

const animations_during = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(":enter", [style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}), animate(animations_during, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}))]),
		transition(":leave", [style({ 'backgroundColor': 'white', transform: 'translate(0, 0)'}), animate(animations_during, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)'}))]),
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
	selector: 'ansyn-edit-case',
	templateUrl: './edit-case.component.html',
	styleUrls: ['./edit-case.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations,
	host
})

export class EditCaseComponent implements OnInit {

	active_case$: Observable<Case> = this.store.select("cases")
		.distinctUntilChanged(this.distinctUntilChangedActiveCase.bind(this))
		.map(this.getCloneActiveCase.bind(this));
	default_case_id$: Observable<string> = this.store.select("cases").map((state: ICasesState) => state.default_case.id);

	contexts_list$: Observable <Context[]> = this.store.select("cases").map( (state: ICasesState) => state.contexts).distinctUntilChanged(_.isEqual);
	contexts_list: Context[];

	case_model:Case;
	on_edit_case = false;
	default_case_id: string;

	@ViewChild("name_input") name_input: ElementRef;

	@HostListener("@modalContent.done") selectText() {
		this.name_input.nativeElement.select();
	}

	constructor(private store: Store<ICasesState>) { }

	distinctUntilChangedActiveCase(state_prev: ICasesState, state_current: ICasesState) {
		return _.isEqual(state_prev.active_case_id, state_current.active_case_id);
	}

	getCloneActiveCase(case_state: ICasesState): Case {
		let s_case: Case = case_state.cases.find((case_value: Case) => case_value.id === case_state.active_case_id);
		if(s_case && s_case.id !== case_state.default_case.id) {
			s_case = _.cloneDeep(s_case);
			this.on_edit_case = true;
		} else {
			s_case = this.getEmptyCase();
		}
		return s_case;
	}

	getEmptyCase(): Case {
		return {
			name:'',
			owner:'',
			last_modified: new Date(),
			state: {
				selected_context_id: "",
				maps: {
					layouts_index: 0,
					active_map_id: 'imagery1',
					data: [
						{
							id:'imagery1',
							data: {
								position: {
									zoom: 0,
									rotation: 0,
									center: {
										type: "Point",
										coordinates: [
											-1032.6339954767493,
											-24.489491521255573
										]
									}
								}
							},
							mapType: defaultMapType,
						},
					]
				},
				time: <any>"",
				region: <any>"",
				facets: <any>"",
			}
		};
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());

		this.active_case$.subscribe((active_case: Case)=>{
			this.case_model = active_case;
		});

		this.contexts_list$.subscribe((_context_list: Context[]) => {
			this.contexts_list = _context_list;
		});

		this.default_case_id$.subscribe((default_id: string) => {
			this.default_case_id = default_id;
		});
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase() {
		if(this.case_model.id && this.case_model.id !== this.default_case_id) {
			this.store.dispatch(new UpdateCaseAction(this.case_model));
		} else {
			this.store.dispatch(new AddCaseAction(this.case_model));
		}
	}

	setContextValues(case_model: Case) {
		let selected_context: Context = _.cloneDeep(this.contexts_list.find((context: Context) => context.id === case_model.state.selected_context_id));
		let [facets, region, time] = [selected_context.facets, selected_context.region, selected_context.time];
		case_model.state = Object.assign(case_model.state, {facets, region ,time});
	}

}
