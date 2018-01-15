import { Component, HostBinding, Input } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { isEqual, throttle } from 'lodash';

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent {
	private _isExpended: boolean;
	private _imgProcessParamDefaults = {
		Contrast: 0,
		Brightness: 0,
		Gamma: 100,
		Saturation: 100,
		Sharpness: 0
	};
	public imgProcessParams: any;	// instead of Object, for Travis testing
	public imgProcessActive: boolean;	// instead of Object, for Travis testing
	public throttledManualImageProcess: Function;	// throttled function

	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._isExpended = value;
	}

	get expand() {
		return this._isExpended;
	}

	constructor(public store$: Store<IToolsState>) {
		this.resetAllParams();
		// limit to once every 200 ms
		this.throttledManualImageProcess = throttle(this.manualImageProcess, 200);
	}

	resetAllParams() {
		this.imgProcessParams = Object.assign({}, this._imgProcessParamDefaults);
		this.imgProcessActive = false;
	}

	manualImageProcess() {
		this.imgProcessActive = !isEqual(this.imgProcessParams, this._imgProcessParamDefaults);
		let dispatchValue = (this.imgProcessActive) ? this.imgProcessParams : undefined;
		this.store$.dispatch(new SetManualImageProcessing({ processingParams: dispatchValue }));
	}

	backToDefault(processParam) {
		this.imgProcessParams[processParam] = this._imgProcessParamDefaults[processParam];
		this.throttledManualImageProcess();
	}

	resetAll() {
		Object.keys(this.imgProcessParams).forEach(key => {
			this.imgProcessParams[key] = this._imgProcessParamDefaults[key];
		});
		this.throttledManualImageProcess();

	}

	close() {
		this.expand = false;
	}
}
