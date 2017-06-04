import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, MapsLayout } from '../reducers/status-bar.reducer';
import { ChangeLayoutAction } from '../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit {
	layouts$: Observable<MapsLayout[]> = this.store.select("status_bar").map((state: IStatusBarState) => state.layouts).distinctUntilChanged(isEqual);
	selected_layout_index$: Observable<number> = this.store.select("status_bar").map((state: IStatusBarState) => state.selected_layout_index).distinctUntilChanged(isEqual);
	selected_layout_index: number;
	@Input() selected_case_name: string;

	ngOnInit(): void {
		this.selected_layout_index$.subscribe((_selected_layout_index: number) => {
			this.selected_layout_index = _selected_layout_index;
		})
	}

	constructor(private store: Store<IStatusBarState>) { }

	layoutSelectChange(selected_layout_index: number) {
		this.store.dispatch(new ChangeLayoutAction(selected_layout_index))
	}

}
