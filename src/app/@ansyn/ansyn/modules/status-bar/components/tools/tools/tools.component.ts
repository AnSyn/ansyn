import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	ClearActiveInteractionsAction,
	SetMeasureDistanceToolState,
	SetSubMenu,
	StartMouseShadow,
	StopMouseShadow
} from '../actions/tools.actions';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	IToolsState,
	selectSubMenu, selectToolFlags,
	toolsStateSelector
} from '../reducers/tools.reducer';
import { map, tap, take } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { MatDialog } from '@angular/material/dialog';
import { ExportMapsPopupComponent } from '../export-maps-popup/export-maps-popup.component';
import { SubMenuEnum, toolsFlags } from '../models/tools.model';
import { selectActiveAnnotationLayer } from '../../../../menu-items/layers-manager/reducers/layers.reducer';

@Component({
	selector: 'ansyn-tools',
	templateUrl: './tools.component.html',
	styleUrls: ['./tools.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ToolsComponent implements OnInit, OnDestroy {
	isDialogShowing = false;
	public displayModeOn = false;
	public flags: Map<toolsFlags, boolean>;

	@AutoSubscription
	public flags$: Observable<Map<toolsFlags, boolean>> = this.store$.select(selectToolFlags).pipe(
		tap((flags: Map<toolsFlags, boolean>) => this.flags = flags)
	);

	isActiveAnnotationLayer$ = this.store$.select(selectActiveAnnotationLayer).pipe(
		map(Boolean)
	);

	@AutoSubscription
	subMenu$ = this.store$.select(selectSubMenu).pipe(
		tap((subMenu) => this.subMenu = subMenu)
	);

	subMenu: SubMenuEnum;

	get subMenuEnum() {
		return SubMenuEnum;
	}

	get isGeoOptionsDisabled() {
		return !this.flags?.get(toolsFlags.geoRegisteredOptionsEnabled);
	}

	get shadowMouseDisabled() {
		return this.flags?.get(toolsFlags.shadowMouseDisabled);
	}

	get onShadowMouse() {
		return this.flags?.get(toolsFlags.shadowMouse);
	}

	get onMeasureTool() {
		return this.flags?.get(toolsFlags.isMeasureToolActive);
	}

	// @TODO display the shadow mouse only if there more then one map .
	constructor(protected store$: Store<any>,
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
			this.store$.dispatch(new StopMouseShadow({ fromUser: true }));
		} else {
			this.store$.dispatch(new StartMouseShadow({ fromUser: true }));
		}
	}

	toggleMeasureDistanceTool() {
		const value = this.onMeasureTool;
		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [] }));
		this.store$.dispatch(new SetMeasureDistanceToolState(!value));
	}

	toggleSubMenu(subMenu: SubMenuEnum, event: MouseEvent = null) {
		if (event) {
			// In order that the sub menu will not recognize the click on the
			// button as a "click outside" and close itself
			event.stopPropagation();
		}
		const value = (subMenu !== this.subMenu) ? subMenu : null;
		this.store$.dispatch(new SetSubMenu(value));
	}

	onAnimation() {
		this.store$.dispatch(new SetSubMenu(null));
	}

	isExpand(subMenu: SubMenuEnum): boolean {
		return this.subMenu === subMenu;
	}

	toggleExportMapsDialog() {
		if (!this.isDialogShowing) {
			const dialogRef = this.dialog.open(ExportMapsPopupComponent, { panelClass: 'custom-dialog' });
			dialogRef.afterClosed().pipe(take(1), tap(() => this.isDialogShowing = false)).subscribe();
			this.isDialogShowing = !this.isDialogShowing;
		}
	}
}
