import { OnInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Spinner } from '@ansyn/core/utils';
import { CaseMapState, Overlay } from '@ansyn/core';
import { Store } from '@ngrx/store';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	BackToWorldAction,
	SynchronizeMapsAction
} from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent implements OnInit, OnDestroy {
	@Input() mapState: CaseMapState;
	@Input() active: boolean;
	@Input() showStatus: boolean;
	@Input() mapsAmount = 1;
	@ViewChild('imageryViewContainer') imageryViewContainer: ElementRef;

	private _showSpinner: boolean;

	@Input('showSpinner')
	public set showSpinner(value: boolean) {
		if (this._showSpinner === value) {
			return;
		}
		this._showSpinner = value;
		this.toggleSpinner();
	}

	public get showSpinner(): boolean {
		return this._showSpinner;
	}

	get overlay(): Overlay {
		return this.mapState.data.overlay;
	}

	private _spinner: Spinner;

	constructor(protected store: Store<any>) {
	}

	toggleSpinner() {
		if (this._spinner) {
			if (this._showSpinner) {
				this._spinner.start('Loading...', 'transparent'); // #EDEDED
			} else {
				this._spinner.stop();
			}
		}
	}

	ngOnInit() {
		this._spinner = new Spinner(this.imageryViewContainer.nativeElement);
		this.toggleSpinner();
	}

	ngOnDestroy(): void {
		this._spinner = null;
	}

	backToWorldView() {
		this.store.dispatch(new BackToWorldAction({ mapId: this.mapState.id }));
	}

	toggleMapSynchronization() {
		this.store.dispatch(new SynchronizeMapsAction({ mapId: this.mapState.id }));
	}

	getProgress() {
		if (this.mapState.progress && this.mapState.progress !== 1) {
			return this.mapState.progress * 100 + '%';
		}
		return 0;
	}

	mouseLeave() {
		if (this.active) {
			this.store.dispatch(new ActiveImageryMouseLeave());
		}
	}

	mouseEnter() {
		if (this.active) {
			this.store.dispatch(new ActiveImageryMouseEnter());
		}
	}
}
