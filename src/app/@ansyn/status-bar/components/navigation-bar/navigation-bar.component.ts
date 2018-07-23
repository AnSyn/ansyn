import { Component, HostListener, Inject } from '@angular/core';
import { GoAdjacentOverlay, GoNextPresetOverlay } from '@ansyn/core/actions/core.actions';
import { Store } from '@ngrx/store';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { ExpandAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { IStatusBarConfig, IToolTipsConfig } from '@ansyn/status-bar/models/statusBar-config.model';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';

@Component({
	selector: 'ansyn-navigation-bar',
	templateUrl: './navigation-bar.component.html',
	styleUrls: ['./navigation-bar.component.less']
})
export class NavigationBarComponent {
	goPrevActive = false;
	goNextActive = false;

	get toolTips(): IToolTipsConfig {
		return this.statusBarConfig.toolTips || {};
	}

	private _nextPresetOverlayKeys = 'fFכ'.split("").map(char => char.charCodeAt(0));

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
		}
	}

	@HostListener('window:keypress', ['$event'])
	onkeypress($event: KeyboardEvent) {
		if ((<Window>$event.currentTarget).document.activeElement instanceof HTMLInputElement) {
			return;
		}

		if (this._nextPresetOverlayKeys.indexOf($event.which) !== -1 ) {
			this.clickGoNextPresetOverlay();
		}
	}

	constructor(protected store: Store<IStatusBarState>,
				@Inject(StatusBarConfig) protected statusBarConfig: IStatusBarConfig) {
	}

	clickGoAdjacent(isNext): void {
		this.store.dispatch(new GoAdjacentOverlay({ isNext }));
	}

	clickGoNextPresetOverlay(): void {
		this.store.dispatch(new GoNextPresetOverlay());
	}

	clickTime(): void {
	}

	clickExpand(): void {
		this.store.dispatch(new ExpandAction());
	}
}
