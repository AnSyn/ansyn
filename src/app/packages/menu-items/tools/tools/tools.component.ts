import { Component, OnInit } from '@angular/core';
import { StartMouseShadow,StopMouseShadow } from '../actions/tools.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ansyn-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit {
	public flags: Map<string,boolean>;
	
	//@todo display the shadow mouse only if there more then one map .
	constructor(private store: Store<any>) { 
		this.flags  = new Map();
		this.flags.set('shadow_mouse',false);
	}

	ngOnInit() {
	}

	toggleShadowMouse(){
		const value = this.flags.get('shadow_mouse');
		
		if(value){
			this.store.dispatch(new StopMouseShadow());		
		}else{
			this.store.dispatch(new StartMouseShadow());
		}

		this.flags.set('shadow_mouse',!value);	
	}

}
