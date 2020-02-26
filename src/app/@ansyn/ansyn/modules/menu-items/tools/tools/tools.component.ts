import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	ClearActiveInteractionsAction,
	SetAutoImageProcessing,
	SetMeasureDistanceToolState,
	SetSubMenu,
	StartMouseShadow,
	StopMouseShadow
} from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectSubMenu, selectToolFlag, selectToolFlags, SubMenuEnum, toolsFlags } from '../reducers/tools.reducer';
import { filter, map, tap } from 'rxjs/operators';
import { selectActiveAnnotationLayer } from '../../layers-manager/reducers/layers.reducer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { MatDialog } from '@angular/material/dialog';
import { ExportMapsPopupComponent } from '../export-maps-popup/export-maps-popup.component';

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less'],
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ToolsComponent implements OnInit, OnDestroy {
	isDialogShowing = false;
	isImageControlActive = false;
	public displayModeOn = false;
	public flags: Map<toolsFlags, boolean>;

	@AutoSubscription
	public flags$: Observable<Map<toolsFlags, boolean>> = this.store.select(selectToolFlags).pipe(
		tap((flags: Map<toolsFlags, boolean>) => this.flags = flags)
	);

	@AutoSubscription
	public imageProcessingDisabled$: Observable<boolean> =
		this.store.select(selectToolFlag(toolsFlags.imageProcessingDisabled)).pipe(
			filter(Boolean),
			tap(this.closeManualProcessingMenu.bind(this))
		);

	isActiveAnnotationLayer$ = this.store.select(selectActiveAnnotationLayer).pipe(
		map(Boolean)
	);

	@AutoSubscription
	subMenu$ = this.store.select(selectSubMenu).pipe(
		tap((subMenu) => this.subMenu = subMenu)
	);

	subMenu: SubMenuEnum;

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

	get imageManualProcessingDisabled() {
		return this.imageProcessingDisabled || this.onAutoImageProcessing;
	}

	get onMeasureTool() {
		return this.flags.get(toolsFlags.isMeasureToolActive);
	}

	// @TODO display the shadow mouse only if there more then one map .
	constructor(protected store: Store<any>,
				public dialog: MatDialog) {

	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.toggleSubMenu(null);
	}

	toggleShadowMouse() {
		const value = this.onShadowMouse;

		if (value) {
			this.store.dispatch(new StopMouseShadow({ fromUser: true }));
		} else {
			this.store.dispatch(new StartMouseShadow({ fromUser: true }));
		}
	}

	toggleMeasureDistanceTool() {
		const value = this.onMeasureTool;
		this.store.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [] }));
		this.store.dispatch(new SetMeasureDistanceToolState(!value));
	}

	toggleAutoImageProcessing() {
		this.store.dispatch(new SetAutoImageProcessing());
		this.closeManualProcessingMenu();
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

	closeManualProcessingMenu() {
		if (this.isExpand(this.subMenuEnum.manualImageProcessing)) {
			this.toggleSubMenu(this.subMenuEnum.manualImageProcessing);
		}
	}

	toggleExportMapsDialog() {
		if (!this.isDialogShowing) {
			const dialogRef = this.dialog.open(ExportMapsPopupComponent, {panelClass: 'custom-dialog'});
			dialogRef.afterClosed().subscribe();
			this.isDialogShowing = !this.isDialogShowing;
		}
	}
}
