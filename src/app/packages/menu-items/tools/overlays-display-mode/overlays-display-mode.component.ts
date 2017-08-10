import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IToolsState } from '../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { ShowOverlaysFootprintAction } from '../actions/tools.actions';
import { OverlayDisplayMode } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-overlays-display-mode',
	templateUrl: './overlays-display-mode.component.html',
	styleUrls: ['./overlays-display-mode.component.less']
})
export class OverlaysDisplayModeComponent {
	private _expand: boolean;
	private _modeOn: boolean;
	private needToDispatchAction = true;
	public _visualizerType: OverlayDisplayMode;

	private selectedMapOverlaysMode$: Observable<OverlayDisplayMode> = this.store$.select('tools')
		.map((state: IToolsState) => {
			return state.activeOverlaysFootprintMode;
		});

	public set visualizerType(value: OverlayDisplayMode) {
		if (this._visualizerType !== value) {
			this._visualizerType = value;
			if (this.needToDispatchAction) {
				this.store$.dispatch(new ShowOverlaysFootprintAction(value));
			}
		}
		// Refresh the parent, need to be outside of if, because load bug
		if (this._visualizerType === 'None') {
			this.modeOn = false;
		} else {
			this.modeOn = true;
		}
	};

	public get visualizerType() {
		return this._visualizerType;
	}

	@Output() expandChange = new EventEmitter();
	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._expand = value;
		this.expandChange.emit(value);
	};

	get expand() {
		return this._expand;
	}

	@Output() modeOnChange = new EventEmitter();
	@Input()
	set modeOn(value) {
		this._modeOn = value;
		this.modeOnChange.emit(value);
	};

	get modeOn() {
		return this._modeOn;
	}

	constructor(private store$: Store<IToolsState>) {
		this.needToDispatchAction = false;
		this.visualizerType = 'None';
		this.needToDispatchAction = true;

		this.selectedMapOverlaysMode$.subscribe((visualizerType)=>{
			this.needToDispatchAction = false;
			if (!visualizerType) {
				this.visualizerType = 'None';
			} else {
				this.visualizerType = visualizerType;
			}
			this.needToDispatchAction = true;
		});
	}

	close() {
		this.expand = false;
	}
}
