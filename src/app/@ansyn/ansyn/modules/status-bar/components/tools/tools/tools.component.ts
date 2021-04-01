import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import {
	ClearActiveInteractionsAction,
	SetSubMenu,
	StartMouseShadow,
	StopMouseShadow, UpdateMeasureDataOptionsAction,
	UpdateToolsFlags
} from '../actions/tools.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectSubMenu, selectToolFlags } from '../reducers/tools.reducer';
import { map, take, tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { MatDialog } from '@angular/material/dialog';
import { ExportMapsPopupComponent } from '../export-maps-popup/export-maps-popup.component';
import { SubMenuEnum, toolsFlags } from '../models/tools.model';
import { selectActiveAnnotationLayer } from '../../../../menu-items/layers-manager/reducers/layers.reducer';
import { ComponentVisibilityService } from '../../../../../app-providers/component-visibility.service';
import { ComponentVisibilityItems } from '../../../../../app-providers/component-mode';
import { PacmanPopupComponent } from '../../../../easter-eggs/pacman-popup/pacman-popup.component';
import { KeysListenerService } from "../../../../core/services/keys-listener.service";

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
	// for component
	readonly isExportShow: boolean;
	readonly isGoToShow: boolean;
	readonly isAnnotationsShow: boolean;
	readonly isMeasuresShow: boolean;
	readonly isShadowMouseShow: boolean;
	//
	isDialogShowing = false;
	public displayModeOn = false;
	public flags: Map<toolsFlags, boolean>;
	toolTipDirection = 'bottom'
	@AutoSubscription
	public flags$: Observable<Map<toolsFlags, boolean>> = this.store$.select(selectToolFlags).pipe(
		tap((flags: Map<toolsFlags, boolean>) => this.flags = flags)
	);

	@AutoSubscription
	onKeyUp$ = () => this.keyListenerService.keyup.pipe(
		tap($event => {
			if (this.keyListenerService.keysWereUsed($event, this._pacmanKeys)) {
				this.togglePacmanDialog();
			}
		})
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

	private _pacmanKeys = 'Ppפ'.split('');

	constructor(
		protected store$: Store<any>,
		public dialog: MatDialog,
		public keyListenerService: KeysListenerService,
		componentVisibilityService: ComponentVisibilityService
	) {
		this.isExportShow = componentVisibilityService.get(ComponentVisibilityItems.EXPORT);
		this.isGoToShow = componentVisibilityService.get(ComponentVisibilityItems.GOTO);
		this.isAnnotationsShow = componentVisibilityService.get(ComponentVisibilityItems.ANNOTATIONS);
		this.isMeasuresShow = componentVisibilityService.get(ComponentVisibilityItems.MEASURES);
		this.isShadowMouseShow = componentVisibilityService.get(ComponentVisibilityItems.SHADOW_MOUSE);
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.toggleSubMenu(null);
	}

	toggleShadowMouse() {
		const value = this.onShadowMouse;

		if (value) {
			this.store$.dispatch(new StopMouseShadow({fromUser: true}));
		} else {
			this.store$.dispatch(new StartMouseShadow({fromUser: true}));
		}
	}

	toggleMeasureDistanceTool() {
		const value = !this.onMeasureTool;
		this.store$.dispatch(new ClearActiveInteractionsAction({skipClearFor: [UpdateMeasureDataOptionsAction]}));
		this.store$.dispatch(new UpdateToolsFlags([{key: toolsFlags.isMeasureToolActive, value}]));
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
			const dialogRef = this.dialog.open(ExportMapsPopupComponent, {panelClass: 'custom-dialog'});
			dialogRef.afterClosed().pipe(take(1), tap(() => this.isDialogShowing = false)).subscribe();
			this.isDialogShowing = !this.isDialogShowing;
		}
	}

	togglePacmanDialog() {
		if (!this.isDialogShowing) {
			const dialogRef = this.dialog.open(PacmanPopupComponent, {panelClass: 'custom-dialog'});
			dialogRef.afterClosed().pipe(take(1), tap(() => this.isDialogShowing = false)).subscribe();
			this.isDialogShowing = !this.isDialogShowing;
		}
	}

}
