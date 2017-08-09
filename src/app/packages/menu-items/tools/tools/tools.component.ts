import { Component, OnInit, Input } from '@angular/core';
import { StartMouseShadow, StopMouseShadow, SetAutoImageProcessing } from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IToolsState } from '../reducers/tools.reducer';
import { isEqual } from 'lodash';

@Component({
  selector: 'ansyn-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit {
	public expandGoTo: boolean;
	public expandVisualizers: boolean;
	private _visualizersOn: boolean;
	public flags: Map<string,boolean>;
	public flags$: Observable<Map<string,boolean>> = this.store.select('tools')
														.map((tools: IToolsState) => tools.flags)
														.distinctUntilChanged(isEqual);

	//@todo display the shadow mouse only if there more then one map .
	constructor(private store: Store<any>) {

	}

	public set visualizersOn(value) {
		this._visualizersOn = value;
	};

	public get visualizersOn() {
		return this._visualizersOn;
	};

	ngOnInit() {
		this.flags$.subscribe(_flags => {
			this.flags = _flags;
		});
	}

	toggleShadowMouse(){
		const value = this.flags.get('shadow_mouse');

		if(value){
			this.store.dispatch(new StopMouseShadow());
		}else{
			this.store.dispatch(new StartMouseShadow());
		}
	}

	toggleExpandGoTo() {
		this.expandVisualizers = false;
		this.expandGoTo = !this.expandGoTo;
	}

	toggleExpandVisualizers() {
		this.expandGoTo = false;
		this.expandVisualizers = !this.expandVisualizers;
	}

	toggleImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing);
	}
}
