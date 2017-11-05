import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	AnnotationClose,
	AnnotationOpen,
	AnnotationVisualizerAgentAction,
	GoToExpandAction,
	SetAutoCloseMenu,
	SetAutoImageProcessing,
	StartMouseShadow,
	StopMouseShadow
} from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IToolsState, toolsStateSelector } from '../reducers/tools.reducer';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit, OnDestroy {
	public gotoExpand$: Observable<boolean> = this.store.select(toolsStateSelector)
		.pluck<IToolsState, boolean>('gotoExpand')
		.distinctUntilChanged();
	public expandGoTo = false;
	public expandOverlaysDisplayMode = false;
	public displayModeOn = false;
	public userAnnotationsToolOpen = false;
	public flags: Map<string, boolean>;
	public isGeoOptionsDisabled = false;
	public flags$: Observable<Map<string, boolean>> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.flags)
		.distinctUntilChanged(isEqual);


	// @TODO display the shadow mouse only if there more then one map .
	constructor(private store: Store<any>) {

	}

	ngOnInit() {
		this.flags$.subscribe(_flags => {
			this.flags = _flags;
			this.isGeoOptionsDisabled = !this.flags.get('geoRegisteredOptionsEnabled');
		});
		this.gotoExpand$.subscribe(_gotoExpand => {
			this.expandGoTo = _gotoExpand;
		});
	}

	ngOnDestroy() {
		this.store.dispatch(new AnnotationClose(false));
		this.store.dispatch(new AnnotationVisualizerAgentAction({
			action: 'removeInteraction',
			maps: 'active'
		}));
	}

	toggleShadowMouse() {
		const value = this.flags.get('shadowMouse');

		if (value) {
			this.store.dispatch(new StopMouseShadow());
		} else {
			this.store.dispatch(new StartMouseShadow());
		}
	}

	toggleExpandGoTo() {
		this.expandOverlaysDisplayMode = false;
		this.store.dispatch(new GoToExpandAction(!this.expandGoTo));

	}

	toggleExpandVisualizers() {
		this.store.dispatch(new GoToExpandAction(false));
		this.expandOverlaysDisplayMode = !this.expandOverlaysDisplayMode;
	}

	toggleImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing);
	}

	toggleAnnotationMenu() {
		// send event to the store that saying the annotation option is enabled
		this.userAnnotationsToolOpen = !this.userAnnotationsToolOpen;
		if (this.userAnnotationsToolOpen) {
			this.store.dispatch(new AnnotationOpen(true))
			this.store.dispatch(new SetAutoCloseMenu(false));
			this.store.dispatch(new AnnotationVisualizerAgentAction({
				action: 'show',
				maps: 'active'
			}));

		} else {
			this.store.dispatch(new AnnotationClose(false));
			this.store.dispatch(new SetAutoCloseMenu(true));
			this.store.dispatch(new AnnotationVisualizerAgentAction({
				action: 'endDrawing',
				maps: 'active'
			}));
		}


	}

}
