import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { Store } from '@ngrx/store';
import { ICasesState } from '../../reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { AddCaseAction, CloseModalAction, LoadContextsAction, UpdateCaseAction } from '../../actions/cases.actions';
import * as _ from "lodash";
import { Case } from '../../models/case.model';
import { Context } from '../../models/context.model';
import { defaultMapType } from '../../';
import { CasesService } from '../../services/cases.service';
import { getPolygonByPoint } from '@ansyn/core/utils/geo';

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

	constructor(private store: Store<ICasesState>, private casesService: CasesService) { }

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
				selected_context_id: undefined,
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
											0,
											0
										]
									}
								}
							},
							mapType: defaultMapType,
						},
					]
				},
				time: {
					type: 'absulote',
					from: new Date(0).toISOString(),
					to: new Date().toISOString()
				},
				region: getPolygonByPoint([0, 0]).geometry,
				facets: <any> ""
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
			if(!this.case_model.id && this.contexts_list.length > 0 ){
				this.case_model.state.selected_context_id = this.contexts_list[0].id;
				this.setContextOnCase();
			}
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
		this.close();
	}

	setContextOnCase() {
		return this.casesService.setContextOnCase(this.case_model, this.selected_context);
	}

	get selected_context() {
		return _.cloneDeep(this.contexts_list.find((context: Context) => context.id === this.case_model.state.selected_context_id));
	}

}
