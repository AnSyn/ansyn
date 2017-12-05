import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

enum SubMenuEnum { goTo, manualImageProcessing, overlays, annotations }

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit, OnDestroy {
	@ViewChild('imageManualProcessing') manualProcessingControls;

	public gotoExpand$: Observable<boolean> = this.store.select(toolsStateSelector)
		.pluck<IToolsState, boolean>('gotoExpand')
		.distinctUntilChanged();

	public subMenuEnum = SubMenuEnum;
	public expandedSubMenu: SubMenuEnum = null;
	public displayModeOn = false;
	public userAnnotationsToolOpen = false;
	public flags: Map<string, boolean>;
	public isGeoOptionsDisabled = false;
	public flags$: Observable<Map<string, boolean>> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.flags)
		.distinctUntilChanged(isEqual);
	public manualImageProcessingParams$: Observable<Object> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.manualImageProcessingParams)
		.distinctUntilChanged();

	// @TODO display the shadow mouse only if there more then one map .
	constructor(protected store: Store<any>) {

	}

	ngOnInit() {
		this.flags$.subscribe(_flags => {
			this.flags = _flags;
			this.isGeoOptionsDisabled = !this.flags.get('geoRegisteredOptionsEnabled');
		});
		this.gotoExpand$.subscribe(_gotoExpand => {
			if (_gotoExpand) {
				this.expandedSubMenu = SubMenuEnum.goTo;
			}
		});
		this.manualImageProcessingParams$.subscribe((processParams) => {
			if (!isEqual(processParams, this.manualProcessingControls.imgProcessParams)) {
				if (!processParams) {
					this.manualProcessingControls.resetAllParams();
				} else {
					this.manualProcessingControls.imgProcessParams = processParams;
				}
			}
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

	toggleAutoImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing());
		this.manualProcessingControls.resetAllParams();
	}

	toggleSubMenu(subMenu: SubMenuEnum) {
		// update new state of expandedSubMenu;
		const lastExpandedSubMenu = this.expandedSubMenu;
		this.expandedSubMenu = (subMenu !== this.expandedSubMenu) ? subMenu : null;
		// if toggle goto - dispatch;
		if (subMenu === SubMenuEnum.goTo || lastExpandedSubMenu === SubMenuEnum.goTo) {
			this.store.dispatch(new GoToExpandAction(this.expandedSubMenu === SubMenuEnum.goTo));
		}
		// if toggle annotations - treat annotations toggle
		if (subMenu === SubMenuEnum.annotations || lastExpandedSubMenu === SubMenuEnum.annotations) {
			this.toggleAnnotationMenu(this.expandedSubMenu === SubMenuEnum.annotations);
		}
	}
	onAnimation() {
		this.store.dispatch(new GoToExpandAction(false));
		this.expandedSubMenu = null;
	}
	toggleAnnotationMenu(subMenuOpen) {
		// send event to the store that saying the annotation option is enabled
		if (subMenuOpen) {
			this.store.dispatch(new AnnotationOpen(true));
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
