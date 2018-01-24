import { Component, HostBinding, Inject, Input } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { isEqual, throttle } from 'lodash';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models';
import { IImageProcParam } from '@ansyn/menu-items/tools/models/tools-config';


export interface IImageProcParamComp extends IImageProcParam {
	value: number;
}


@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent {
	private _isExpended: boolean;
	public imgProcessActive: boolean;	// instead of Object, for Travis testing
	public throttledManualImageProcess: Function;	// throttled function

	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._isExpended = value;
	}

	get expand() {
		return this._isExpended;
	}

	params: Array<IImageProcParamComp> = [];

	constructor(public store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig) {
		this.resetAllParams();
		this.params = config.ImageProcParams.map(param => {
			return { ...param,  value: 0 };
		});
		// limit to once every 200 ms
		this.throttledManualImageProcess = throttle(this.manualImageProcess, 200);
	}


	resetAllParams() {
		this.params.forEach(param => {
			param.value = param.defaultValue;
		});
		this.imgProcessActive = false;
	}

	manualImageProcess() {
		this.imgProcessActive = !isEqual(
			this.params.map(param => {
				return param.value;
			}),
			this.params.map(param => {
				return param.defaultValue;
			})
		);
		let dispatchValue = {};
		if (this.imgProcessActive) {
			this.params.forEach(param => {
				dispatchValue[param.name] = param.value;
			});
		}
		else {
			dispatchValue = undefined;
		}
		this.store$.dispatch(new SetManualImageProcessing({ processingParams: dispatchValue }));
	}

	resetOne(param) {
		param.value = param.defaultValue;
		this.throttledManualImageProcess();
	}

	resetAll() {
		this.resetAllParams();
		this.throttledManualImageProcess();

	}

	close() {
		this.expand = false;
	}
}
