import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
	public expandOverlaysDisplayMode: boolean;
	public displayModeOn: boolean;
	public flags: Map<string,boolean>;
	public isGeoOptionsDisabled: boolean;
	public flags$: Observable<Map<string,boolean>> = this.store.select('tools')
														.map((tools: IToolsState) => tools.flags)
														.distinctUntilChanged(isEqual);

	// for tests
	@ViewChild('displayOverlayDiv') displayOverlayDiv: ElementRef;

	//@todo display the shadow mouse only if there more then one map .
	constructor(private store: Store<any>) {

	}

	ngOnInit() {
		this.flags$.subscribe(_flags => {
			this.flags = _flags;
			this.isGeoOptionsDisabled = !this.flags.get('geo_registered_options_enabled');
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
		this.expandOverlaysDisplayMode = false;
		this.expandGoTo = !this.expandGoTo;
	}

	toggleExpandVisualizers() {
		this.expandGoTo = false;
		this.expandOverlaysDisplayMode = !this.expandOverlaysDisplayMode;
	}

	toggleImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing);
	}

}
