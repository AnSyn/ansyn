import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction, GoAdjacentOverlay } from '../../../status-bar/actions/status-bar.actions';
import { IStatusBarConfig } from '../../../status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { EnableCopyOriginalOverlayDataAction, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { ActivateScannedAreaAction } from '../../overlay-status/actions/overlay-status.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, filter } from 'rxjs/operators';
import { selectDropsAscending, selectFilteredOveralys } from '../../reducers/overlays.reducer';
import { combineLatest } from 'rxjs';
import { IOverlay, IOverlayDrop } from '../../models/overlay.model';

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
	hasOverlayDisplay: boolean;
	isFirstOverlay: boolean;
	isLastOverlay: boolean;
	overlaysLength: number;

	@AutoSubscription
	hasOverlayDisplay$ = this.store.select(selectOverlayOfActiveMap).pipe(
		tap(overlay => this.hasOverlayDisplay = Boolean(overlay))
	);

	@AutoSubscription
	isLastOrFirstOverlay$ = combineLatest(
		this.store.select(selectOverlayOfActiveMap),
		this.store.select(selectDropsAscending),
		this.store.select(selectFilteredOveralys)).pipe(
		filter(([activeMapOverlay, overlays, filtered]: [IOverlay, IOverlayDrop[], any[]]) => Boolean(activeMapOverlay) && Boolean(overlays.length)),
		tap(([activeMapOverlay, overlays, filtered]: [IOverlay, IOverlayDrop[],  IOverlay[]]) => {
			this.overlaysLength = filtered.length;
			this.isFirstOverlay = activeMapOverlay.id === overlays[0].id;
			this.isLastOverlay = activeMapOverlay.id === overlays[overlays.length - 1].id;
		})
	);

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
		}

		if (this.keysWereUsed($event, this._overlayHackKeys)) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(false));
		}
	}

	@HostListener('window:keydown', ['$event'])
	onkeydown($event: KeyboardEvent) {
		if (this.isElementNotValid($event)) {
			return;
		}

		if (this.keyWasUsed($event, 'ArrowRight', 39)) {
			this.goNextActive = true;
		} else if (this.keyWasUsed($event, 'ArrowLeft', 37)) {
			this.goPrevActive = true;
		} 

		if (this.keysWereUsed($event, this._overlayHackKeys)) {
			this.store.dispatch(new EnableCopyOriginalOverlayDataAction(true));
		}
	}

	@HostListener('window:keypress', ['$event'])
	onkeypress($event: KeyboardEvent) {
		if (this.isElementNotValid($event)) {
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
