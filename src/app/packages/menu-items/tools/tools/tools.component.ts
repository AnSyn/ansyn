import { Component, OnInit, Input } from '@angular/core';
import { StartMouseShadow,StopMouseShadow } from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IToolsState } from '../reducers/tools.reducer';

@Component({
  selector: 'ansyn-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit {
	public flags: Map<string,boolean>;
	public flags$: Observable<Map<string,boolean>> = this.store.select('tools')
														.map((tools: IToolsState) => tools.flags);
	//@todo display the shadow mouse only if there more then one map .
	constructor(private store: Store<any>) {

	}

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

		//this.flags.set('shadow_mouse',!value);
	}

}
