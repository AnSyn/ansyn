import { Component } from '@angular/core';
import { MapSettings } from '@ansyn/imagery/imagery/mapSettings';
import { ImageryComponentSettings } from '@ansyn/imagery/imagery/imageryComponentSettings';
import { IAppState } from '../app-reducers';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { ICasesState } from '../packages/menu-items/cases/reducers/cases.reducer';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})
export class AnsynComponent {

	maps_data$: Observable<any[]> = this.store.select('cases').map((state: ICasesState) => {
		const s_case = state.cases[state.selected_case.index];
		let maps_data;
		if(s_case) {
			maps_data = s_case.state.maps.data;
		} else {
			maps_data = [];
		}
		return maps_data;
	}).distinctUntilChanged(_.isEqual);

	maps_data: any[];


	constructor(private store: Store<IAppState>) {
		this.maps_data$.subscribe((_maps_data)=>{
			this.maps_data = _maps_data;
		})
	}

}
