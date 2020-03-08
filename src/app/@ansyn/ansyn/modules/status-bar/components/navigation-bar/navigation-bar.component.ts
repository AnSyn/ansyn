import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../reducers/status-bar.reducer';
import { ExpandAction } from '../../actions/status-bar.actions';
import { IStatusBarConfig, IToolTipsConfig } from '../../models/statusBar-config.model';
import { StatusBarConfig } from '../../models/statusBar.config';
import { GoAdjacentOverlay, GoNextPresetOverlay } from '../../actions/status-bar.actions';
import { EnableCopyOriginalOverlayDataAction, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { ActivateScannedAreaAction } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { selectPresetOverlays } from '../../../overlays/overlay-status/reducers/overlay-status.reducer';

@Component({
	selector: 'ansyn-navigation-bar',
	templateUrl: './navigation-bar.component.html',
	styleUrls: ['./navigation-bar.component.less']
})
@AutoSubscriptions()
export class NavigationBarComponent implements OnInit, OnDestroy{
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

	private _nextPresetOverlayKeys = 'qQ/'.split('').map(char => char.charCodeAt(0));
	private _scannedAreaKey = '`~;'.split('').map(char => char.charCodeAt(0));
	private _overlayHack = 'Eeק'.split('').map(char => char.charCodeAt(0));

	@HostListener('window:keyup', ['$event'])
	onkeyup($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.which === 39) { // ArrowRight
			this.clickGoAdjacent(true);
			this.goNextActive = false;
		} else if ($event.which === 37) { // ArrowLeft
			this.clickGoAdjacent(false);
			this.goPrevActive = false;
		} else if (this._nextPresetOverlayKeys.indexOf($event.which) !== -1) {
			this.clickGoNextPresetOverlay();
			this.goNextQuickLoop = false;
		}

		if (this._overlayHack.indexOf($event.which) !== -1) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(false));
		}
	}

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if ($event.which === 39) { // ArrowRight
			this.goNextActive = true;
		} else if ($event.which === 37) { // ArrowLeft
			this.goPrevActive = true;
		} else if (this._nextPresetOverlayKeys.indexOf($event.which) !== -1) {
			this.goNextQuickLoop = true;
		}

		if (this._overlayHack.indexOf($event.which) !== -1) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(true));
		}
	}

	@HostListener('window:keypress', ['$event'])
	onkeypress($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if (this._scannedAreaKey.indexOf($event.which) !== -1) {
			this.clickScannedArea();
		}
	}

	constructor(protected store: Store<IStatusBarState>,
				@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig) {
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
