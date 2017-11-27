import { Component, HostBinding, Input } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { isEqual } from 'lodash';

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
		Saturation: 100
	};
	public imgProcessParams: any;	// instead of Object, for Travis testing

	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._isExpended = value;
	}

	get expand() {
		return this._isExpended;
	}

	constructor(public store$: Store<IToolsState>) {
		this.resetAllParams();
	}

	resetAllParams() {
		this.imgProcessParams = Object.assign({}, this._imgProcessParamDefaults);
	}

	manualImageProcess() {
		let dispatchValue = this.imgProcessParams;
		if (isEqual(this.imgProcessParams, this._imgProcessParamDefaults)) {
			dispatchValue = null;
		}
		this.store$.dispatch(new SetManualImageProcessing({ processingParams: dispatchValue }));
	}

	backToDefault(processParam) {
		this.imgProcessParams[processParam] = this._imgProcessParamDefaults[processParam];
		this.manualImageProcess();
	}

	close() {
		this.expand = false;
	}
}
