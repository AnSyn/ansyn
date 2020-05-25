import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction, GoAdjacentOverlay, GoNextPresetOverlay } from '../../../status-bar/actions/status-bar.actions';
import { IStatusBarConfig } from '../../../status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { EnableCopyOriginalOverlayDataAction, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { ActivateScannedAreaAction } from '../../overlay-status/actions/overlay-status.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { selectPresetOverlays } from '../../overlay-status/reducers/overlay-status.reducer';

@Component({
	selector: 'ansyn-overlay-navigation-bar',
	templateUrl: './overlay-navigation-bar.component.html',
	styleUrls: ['./overlay-navigation-bar.component.less']
})
@AutoSubscriptions()
export class OverlayNavigationBarComponent implements OnInit, OnDestroy {
	goPrevActive = false;
	goNextActive = false;
	goNextQuickLoop = false;
	scanAreaActive = false;
	hasPresetOverlays: boolean;
	hasOverlayDisplay: boolean;

	@AutoSubscription
	hasOverlayDisplay$ = this.store.select(selectOverlayOfActiveMap).pipe(
		tap(overlay => this.hasOverlayDisplay = Boolean(overlay))
	);

	@AutoSubscription
	hasPresetOverlays$ = this.store.select(selectPresetOverlays).pipe(
		tap(presetOverlays => this.hasPresetOverlays = presetOverlays.length > 0)
	);

	private _nextPresetOverlayKeys = 'qQ/'.split('');
	private _scannedAreaKeys = '`~;'.split('');
	private _overlayHackKeys = 'Eeק'.split('');

	isElementNotValid($event: KeyboardEvent) {
		const { activeElement } = (<Window>$event.currentTarget).document;
		return this.isElementInput(activeElement) || this.isTimePicker(activeElement);
	}

	isElementInput(activeElement) {
		return activeElement instanceof HTMLInputElement;
	}

	isTimePicker(activeElement) {
		const { className } = activeElement;
		return className.includes('owl') || className.includes('title');
	}

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if (this.isElementNotValid($event)) {
			return;
		}

		if (this.keyWasUsed($event, 'ArrowRight', 39)) {
			this.clickGoAdjacent(true);
			this.goNextActive = false;
		} else if (this.keyWasUsed($event, 'ArrowLeft', 37)) {
			this.clickGoAdjacent(false);
			this.goPrevActive = false;
		} else if (this.keysWereUsed($event, this._nextPresetOverlayKeys)) {
			this.clickGoNextPresetOverlay();
			this.goNextQuickLoop = false;
		}

		if (this.keysWereUsed($event, this._overlayHackKeys)) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(false));
		}
	}

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if (!this.isElementNotValid($event)) {
			return;
		}

		if (this.keyWasUsed($event, 'ArrowRight', 39)) {
			this.goNextActive = true;
		} else if (this.keyWasUsed($event, 'ArrowLeft', 37)) {
			this.goPrevActive = true;
		} else if (this.keysWereUsed($event, this._nextPresetOverlayKeys)) {
			this.goNextQuickLoop = true;
		}

		if (this.keysWereUsed($event, this._overlayHackKeys)) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(true));
		}
	}

	@HostListener('window:keypress', ['$event'])
	onkeypress($event: KeyboardEvent) {
		if (!this.isElementNotValid($event)) {
			return;
		}

		if (this.keysWereUsed($event, this._scannedAreaKeys)) {
			this.clickScannedArea();
		}
	}

	constructor(protected store: Store<IStatusBarState>,
				@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig) {
	}

	private keyWasUsed(event: KeyboardEvent, key: string, keycode: number = key.charCodeAt(0)): boolean {
		return event.key === key || event.which === keycode;
		// We need to check also on the old field event.which, for Chrome 44
	}

	private keysWereUsed(event: KeyboardEvent, keys: string[]): boolean {
		return keys.some(key => this.keyWasUsed(event, key));
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
