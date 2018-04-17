import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	GoToExpandAction,
	SetAnnotationMode,
	SetAutoCloseMenu,
	SetAutoImageProcessing,
	SetMeasureDistanceToolState,
	StartMouseShadow,
	StopMouseShadow
} from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IToolsState, toolsFlags, toolsStateSelector } from '../reducers/tools.reducer';
import { ClearActiveInteractionsAction } from '@ansyn/core';
import { ToggleAnnotations } from '@ansyn/menu-items/tools/actions/tools.actions';

export enum SubMenuEnum { goTo, manualImageProcessing, overlays, annotations }

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit, OnDestroy {

	public gotoExpand$: Observable<boolean> = this.store.select(toolsStateSelector)
		.pluck<IToolsState, boolean>('gotoExpand')
		.distinctUntilChanged();
	imageProcessInitParams = null;
	isImageControlActive = false;
	public subMenuEnum = SubMenuEnum;
	public expandedSubMenu: SubMenuEnum = null;
	public displayModeOn = false;
	public userAnnotationsToolOpen = false;
	public flags: Map<toolsFlags, boolean>;
	public flags$: Observable<Map<toolsFlags, boolean>> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.flags)
		.distinctUntilChanged();
	public manualImageProcessingParams$: Observable<Object> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.manualImageProcessingParams)
		.distinctUntilChanged();

	get isGeoOptionsDisabled() {
		return !this.flags.get(toolsFlags.geoRegisteredOptionsEnabled);
	}

	get imageProcessingDisabled() {
		return this.flags.get(toolsFlags.imageProcessingDisabled);
	}

	get shadowMouseDisabled() {
		return this.flags.get(toolsFlags.shadowMouseDisabled);
	}

	get onShadowMouse() {
		return this.flags.get(toolsFlags.shadowMouse);
	}

	get onAutoImageProcessing() {
		return this.flags.get(toolsFlags.autoImageProcessing);
	}

	get onMeasureTool() {
		return this.flags.get(toolsFlags.isMeasureToolActive);
	}

	// @TODO display the shadow mouse only if there more then one map .
	constructor(protected store: Store<any>) {

	}

	ngOnInit() {
		this.flags$.subscribe(_flags => {
			this.flags = _flags;
		});
		this.gotoExpand$.subscribe(_gotoExpand => {
			if (_gotoExpand) {
				this.expandedSubMenu = SubMenuEnum.goTo;
			}
		});
		this.manualImageProcessingParams$.subscribe((processParams) => {
			this.imageProcessInitParams = processParams;
		});
	}

	ngOnDestroy() {
		this.store.dispatch(new ToggleAnnotations(false));
	}

	toggleShadowMouse() {
		const value = this.onShadowMouse;

		if (value) {
			this.store.dispatch(new StopMouseShadow());
		} else {
			this.store.dispatch(new StartMouseShadow());
		}
	}

	toggleMeasureDistanceTool() {
		const value = this.onMeasureTool;
		this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetMeasureDistanceToolState] }));
		this.store.dispatch(new SetMeasureDistanceToolState(!value));
	}

	toggleAutoImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing());
		this.imageProcessInitParams = null;
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
			this.store.dispatch(new ToggleAnnotations(true));
			this.store.dispatch(new SetAutoCloseMenu(false));
		} else {
			this.store.dispatch(new ToggleAnnotations(false));
			this.store.dispatch(new SetAutoCloseMenu(true));
			this.store.dispatch(new SetAnnotationMode());
		}
	}

	isExpand(subMenu: SubMenuEnum): boolean {
		return this.expandedSubMenu === subMenu;
	}
}
