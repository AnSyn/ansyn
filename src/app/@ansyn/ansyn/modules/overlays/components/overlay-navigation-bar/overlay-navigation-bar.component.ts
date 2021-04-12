import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
	IStatusBarState,
	selectMarkedSecondSearchSensors,
	selectPacmanMode
} from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction, GoAdjacentOverlay } from '../../../status-bar/actions/status-bar.actions';
import { IStatusBarConfig } from '../../../status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { EnableCopyOriginalOverlayDataAction, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { ActivateScannedAreaAction } from '../../overlay-status/actions/overlay-status.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, filter, withLatestFrom } from 'rxjs/operators';
import { selectDropsAscending, selectFilteredOverlays } from '../../reducers/overlays.reducer';
import { combineLatest } from 'rxjs';
import { IOverlay, IOverlayDrop } from '../../models/overlay.model';
import { TranslateService } from '@ngx-translate/core';
import { KeysListenerService } from "../../../core/services/keys-listener.service";
import { LoadOverlaysAction } from "../../actions/overlays.actions";

@Component({
	selector: 'ansyn-overlay-navigation-bar',
	templateUrl: './overlay-navigation-bar.component.html',
	styleUrls: ['./overlay-navigation-bar.component.less']
})
@AutoSubscriptions()
export class OverlayNavigationBarComponent implements OnInit, OnDestroy {
	goPrevActive = false;
	goNextActive = false;
	hasOverlayDisplay: boolean;
	isFirstOverlay: boolean;
	isLastOverlay: boolean;
	overlaysLength: number;

	@AutoSubscription
	onKeyDown$ = () => this.keyListenerService.keydown.pipe(
		withLatestFrom(this.store.select(selectPacmanMode)),
		filter(([$event, isPacmanMode]: [KeyboardEvent, boolean]) => !isPacmanMode),
		tap(([$event, isPacmanMode]: [KeyboardEvent, boolean]) => {
			if (this.keyListenerService.keyWasUsed($event, 'ArrowRight', 39)) {
				this.goNextActive = true;
			} else if (this.keyListenerService.keyWasUsed($event, 'ArrowLeft', 37)) {
				this.goPrevActive = true;
			}

			if (this.keyListenerService.keysWereUsed($event, this._overlayHackKeys)) {
				this.store.dispatch(new EnableCopyOriginalOverlayDataAction(true));
			}
		})
	);

	@AutoSubscription
	onkeypress$ = () => this.keyListenerService.keyup.pipe(
		tap($event => {
				if (this.keyListenerService.isElementNotValid($event)) {
					return;
				}

				if (this.keyListenerService.keysWereUsed($event, this._scannedAreaKeys)) {
					this.clickScannedArea();
				}
			}
		));

	@AutoSubscription
	onKeyUp$ = () => this.keyListenerService.keyup.pipe(
		withLatestFrom(this.store.select(selectPacmanMode)),
		filter(([$event, isPacmanMode]: [KeyboardEvent, boolean]) => !isPacmanMode),
		tap(([$event, isPacmanMode]: [KeyboardEvent, boolean]) => {
			if (this.keyListenerService.isElementNotValid($event)) {
				return;
			}

			if (this.keyListenerService.keyWasUsed($event, 'ArrowRight', 39)) {
				this.clickGoAdjacent(true);
				this.goNextActive = false;
			} else if (this.keyListenerService.keyWasUsed($event, 'ArrowLeft', 37)) {
				this.clickGoAdjacent(false);
				this.goPrevActive = false;
			}

			if (this.keyListenerService.keysWereUsed($event, this._overlayHackKeys)) {
				this.store.dispatch(new EnableCopyOriginalOverlayDataAction(false));
			}

			if (this.keyListenerService.keysWereUsed($event, this._toggleDirectionKeys)) {
				const direction = this.translateService.instant('direction');
				this.translateService.set('direction', direction === 'rtl' ? 'ltr' : 'rtl', 'default');
			}
		})
	);

	@AutoSubscription
	hasOverlayDisplay$ = this.store.select(selectOverlayOfActiveMap).pipe(
		tap(overlay => this.hasOverlayDisplay = Boolean(overlay))
	);

	@AutoSubscription
	isLastOrFirstOverlay$ = combineLatest([
		this.store.select(selectOverlayOfActiveMap),
		this.store.select(selectDropsAscending),
		this.store.select(selectFilteredOverlays)
	]).pipe(
		filter(([activeMapOverlay, overlays, filtered]: [IOverlay, IOverlayDrop[], any[]]) => Boolean(activeMapOverlay) && Boolean(overlays.length)),
		tap(([activeMapOverlay, overlays, filtered]: [IOverlay, IOverlayDrop[], IOverlay[]]) => {
			this.overlaysLength = filtered.length;
			this.isFirstOverlay = activeMapOverlay.id === overlays[0].id;
			this.isLastOverlay = activeMapOverlay.id === overlays[overlays.length - 1].id;
		})
	);

	private _scannedAreaKeys = '`~;'.split('');
	private _overlayHackKeys = 'Eeק'.split('');
	private _toggleDirectionKeys = 'Ddג'.split('');

	constructor(
		protected store: Store<IStatusBarState>,
		public keyListenerService: KeysListenerService,
		@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
		protected translateService: TranslateService
	) {
	}

	clickGoAdjacent(isNext): void {
		this.store.dispatch(new GoAdjacentOverlay({isNext}));
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
