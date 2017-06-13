import { IAppState } from '../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { IStatusBarState, MapsLayout } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import "@ansyn/core/utils/clone-deep";
import { ActivatedRoute, Params } from '@angular/router';
import { LoadCaseAction, LoadDefaultCaseAction } from '../packages/menu-items/cases/actions/cases.actions';
import { isEmpty, isEqual } from 'lodash';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit{
	selected_layout$: Observable<MapsLayout> = this.store.select('status_bar').map((state: IStatusBarState) => state.layouts[state.selected_layout_index]).distinctUntilChanged(isEqual);
	selected_case$: Observable<Case> = this.store.select('cases').map((state: ICasesState) => state.selected_case).cloneDeep().distinctUntilChanged(isEqual);
	maps$: Observable<any[]> = this.store.select('cases').map((state: ICasesState) => {

		const s_case = state.selected_case;
		return s_case ? s_case.state.maps : {data: []};
	}).distinctUntilChanged(isEqual);

	overlays_count$ = this.store.select('overlays').map((state: IOverlayState) => state.overlays.size);

	selected_layout: MapsLayout;
	selected_case: Case;
	maps: any;
	overlays_count: number;
	active_map;
	overlay_name = "";

	constructor(private store: Store<IAppState>, public activatedRoute: ActivatedRoute) {}

	ngOnInit(): void {
		this.selected_case$.subscribe((selected_case) => {this.selected_case = selected_case});
		this.selected_layout$.subscribe((selected_layout) => {this.selected_layout = selected_layout});
		this.maps$.subscribe((maps) => {
			this.maps = maps;

			this.active_map = this.maps.data.find((map) => map.id === this.maps.active_map_id);

			if(this.active_map){
				this.overlay_name = this.active_map.data.selectedOverlay ? this.active_map.data.selectedOverlay.name : "";
			}
		});
		this.overlays_count$.subscribe(_overlays_count => {this.overlays_count = _overlays_count;});

		this.activatedRoute.params.subscribe((params: Params) => {
			if(isEmpty(params['case_id'])) {
				this.store.dispatch(new LoadDefaultCaseAction());
			} else {
				this.store.dispatch(new LoadCaseAction(params['case_id']));
			}
		});
	}

	onActiveImagery(active_map_id: string) {
		this.selected_case.state.maps.active_map_id = active_map_id;
		this.store.dispatch(new UpdateCaseAction(this.selected_case))
	}

}
