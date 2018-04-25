import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	SetAutoImageProcessing,
	SetMeasureDistanceToolState,
	StartMouseShadow,
	StopMouseShadow
} from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IToolsState, SubMenuEnum, toolsFlags, toolsStateSelector, selectSubMenu } from '../reducers/tools.reducer';
import { SetSubMenu } from '../actions/tools.actions';
import { ClearActiveInteractionsAction } from '@ansyn/core/actions/core.actions';

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less']
})
export class ToolsComponent implements OnInit, OnDestroy {
	imageProcessInitParams = null;
	isImageControlActive = false;
	public displayModeOn = false;
	public flags: Map<toolsFlags, boolean>;
	public flags$: Observable<Map<toolsFlags, boolean>> = this.store.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.flags)
		.distinctUntilChanged();

	subMenu$ = this.store.select(selectSubMenu).do((subMenu) => this.subMenu = subMenu);
	subMenu: SubMenuEnum;

	subscribers = [];

	get subMenuEnum() {
		return SubMenuEnum;
	}

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
		this.subscribers.push(
			this.subMenu$.subscribe(),
			this.flags$.subscribe(_flags => {
				this.flags = _flags;
			})
		);
	}

	ngOnDestroy() {
		this.toggleSubMenu(null);
		this.subscribers.forEach(sub => sub.unsubscribe());
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
		if (this.isExpand(this.subMenuEnum.manualImageProcessing)) {
			this.toggleSubMenu(this.subMenuEnum.manualImageProcessing);
		}
		this.imageProcessInitParams = null;
	}

	toggleSubMenu(subMenu: SubMenuEnum) {
		const value = (subMenu !== this.subMenu) ? subMenu : null;
		this.store.dispatch(new SetSubMenu(value));
	}

	onAnimation() {
		this.store.dispatch(new SetSubMenu(null));
	}

	isExpand(subMenu: SubMenuEnum): boolean {
		return this.subMenu === subMenu;
	}
}
