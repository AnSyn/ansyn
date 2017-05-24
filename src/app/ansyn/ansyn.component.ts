import { MapSettings } from '@ansyn/imagery/imagery/mapSettings';
import { ImageryComponentSettings } from '@ansyn/imagery/imagery/imageryComponentSettings';
import { IAppState } from '../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { IStatusBarState, MapsLayout } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { cloneDeep } from 'lodash'
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import * as _ from 'lodash';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit{
	selected_layout$: Observable<MapsLayout> = this.store.select('status_bar').map((state: IStatusBarState) => state.layouts[state.selected_layout_index]).distinctUntilChanged(_.isEqual);
	selected_case$: Observable<Case> = this.store.select('cases').map(((state: ICasesState) => cloneDeep(state.cases[state.selected_case.index]))).distinctUntilChanged(_.isEqual);
	maps$: Observable<any[]> = this.store.select('cases').map((state: ICasesState) => {

		const s_case = state.cases[state.selected_case.index];
		return s_case ? s_case.state.maps : {data: []};
	}).distinctUntilChanged(_.isEqual);

	selected_layout: MapsLayout;
	selected_case: Case;
	maps: any[];

	constructor(private store: Store<IAppState>) {}

	ngOnInit(): void {
		this.selected_case$.subscribe((selected_case) => {this.selected_case = selected_case});
		this.selected_layout$.subscribe((selected_layout) => {this.selected_layout = selected_layout});
		this.maps$.subscribe((maps) => {this.maps = maps});
	}



	onActiveImagery(active_map_id: string) {
		this.selected_case.state.maps.active_map_id = active_map_id;
		this.store.dispatch(new UpdateCaseAction(this.selected_case))
	}

}
