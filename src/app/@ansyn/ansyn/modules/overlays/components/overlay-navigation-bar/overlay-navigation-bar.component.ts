import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction } from '../../../status-bar/actions/status-bar.actions';
import { IStatusBarConfig } from '../../../status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { GoAdjacentOverlay, GoNextPresetOverlay } from '../../../status-bar/actions/status-bar.actions';
import { EnableCopyOriginalOverlayDataAction, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { ActivateScannedAreaAction } from '../../overlay-status/actions/overlay-status.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { selectPresetOverlays } from '../../overlay-status/reducers/overlay-status.reducer';

@Component({
	selector: 'ansyn-overlay-navigation-bar',
	templateUrl: './overlay-navigation-bar.component.html',
	styleUrls: ['./overlay-navigation-bar.component.less']
})
@AutoSubscriptions()
export class OverlayNavigationBarComponent implements OnInit, OnDestroy{
	goPrevActive = false;
	goNextActive = false;
	goNextQuickLoop = false;
	scanAreaActive = false;
	hasPresetOverlays: boolean;
	hasOverlayDisplay: boolean;

	@AutoSubscription
	hasOverlayDisplay$ = this.store.select(selectOverlayOfActiveMap).pipe(
		tap( overlay => this.hasOverlayDisplay = Boolean(overlay))
	);

	@AutoSubscription
	hasPresetOverlays$ = this.store.select(selectPresetOverlays).pipe(
		tap( presetOverlays => this.hasPresetOverlays = presetOverlays.length > 0)
	);

	private _nextPresetOverlayKeys = 'qQ/'.split('');
	private _scannedAreaKey = '`~;'.split('');
	private _overlayHack = 'Eeק'.split('');

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if (this.isArrowRight($event)) { // ArrowRight
			this.clickGoAdjacent(true);
			this.goNextActive = false;
		} else if (this.isArrowLeft($event)) { // ArrowLeft
			this.clickGoAdjacent(false);
			this.goPrevActive = false;
		} else if (this._nextPresetOverlayKeys.indexOf($event.key) !== -1) {
			this.clickGoNextPresetOverlay();
			this.goNextQuickLoop = false;
		}

		if (this._overlayHack.indexOf($event.key) !== -1) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(false));
		}
	}

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if (this.isArrowRight($event)) { // ArrowRight
			this.goNextActive = true;
		} else if (this.isArrowLeft($event)) { // ArrowLeft
			this.goPrevActive = true;
		} else if (this._nextPresetOverlayKeys.indexOf($event.key) !== -1) {
			this.goNextQuickLoop = true;
		}

		if (this._overlayHack.indexOf($event.key) !== -1) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(true));
		}
	}

	@HostListener('window:keypress', ['$event'])
	onkeypress($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if (this._scannedAreaKey.indexOf($event.key) !== -1) {
			this.clickScannedArea();
		}
	}

	constructor(protected store: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
	}

	private isArrowRight(event: KeyboardEvent) {
		return event.key === 'ArrowRight' || event.which === 39;
		// We need to check also on the old field event.which, for Chrome 44
	}

	private isArrowLeft(event: KeyboardEvent) {
		return event.key === 'ArrowLeft' || event.which === 37;
		// We need to check also on the old field event.which, for Chrome 44
	}

	clickGoAdjacent(isNext): void {
		this.store.dispatch(new GoAdjacentOverlay({ isNext }));
	}

	clickScannedArea(): void {
		this.store.dispatch(new ActivateScannedAreaAction());
	}

	clickGoNextPresetOverlay(): void {
		this.store.dispatch(new GoNextPresetOverlay());
	}

	clickTime(): void {
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}
}
