///<reference path="../../../../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import { Component, EventEmitter, HostBinding, Inject, Input, Output, OnInit } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models';
import { IImageProcParam } from '@ansyn/menu-items/tools/models/tools-config';
import { ImageManualProcessArgs } from '@ansyn/core';
import { toolsStateSelector } from '@ansyn/menu-items';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';


export interface IImageProcParamComp extends IImageProcParam {
	value: number;
}


@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit{


	private _isExpended: boolean;

	// public throttledManualImageProcess: Function;	// throttled function

	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._isExpended = value;
	}

	get expand() {
		return this._isExpended;
	}

	@Input()
	set initParams(_initParams) {
		if (_initParams) {
			const isChangeFromInit = this.params.some(({ value, name }) => value !== _initParams[name]);
			if (isChangeFromInit) {
				this.params.forEach((param) => param.value = _initParams[param.name]);
				this.manualImageProcess();
			}
		}
		else {
			this.resetParams();
			this.isActive.emit(false);
		}
	}

	@Output() isActive = new EventEmitter<boolean>();


	params: Array<IImageProcParamComp> = this.config.ImageProcParams.map(param => {
		return { ...param, value: param.defaultValue };
	});

	constructor(public store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig) {
		// this.throttledManualImageProcess = throttle(this.manualImageProcess, 200);
	}

	manualImageProcess() {

		const isChangeFromDefualt = this.params.some(({ value, defaultValue }) => value !== defaultValue);
		let dispatchValue = <ImageManualProcessArgs> {};
		if (isChangeFromDefualt) {
			this.params.forEach(param => {
				dispatchValue[param.name] = param.value;
			});
		}
		else {
			dispatchValue = undefined;
		}
		this.isActive.emit(isChangeFromDefualt);
		this.store$.dispatch(new SetManualImageProcessing({ processingParams: dispatchValue }));
	}

	resetOne(param) {
		param.value = param.defaultValue;
		this.manualImageProcess();
	}

	resetAllParamsAndEmit() {
		this.resetParams();
		this.manualImageProcess();
		this.isActive.emit(false);
	}

	resetParams() {
		this.params.forEach(param => {
			param.value = param.defaultValue;
		});
	}

	close() {
		this.expand = false;
	}

	ngOnInit(): void {
		this.resetParams();
		this.store$.select(toolsStateSelector)
			.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(toolsStateSelector))
			.subscribe(res =>
			{
				if (res[0].imageProcessingHash[res[1].activeMapId] !== undefined) {
					this.params.forEach(param => {
						this.params[this.arrayObjectIndexOf(this.params, param.name, 'name')].value = res[0].imageProcessingHash[res[1].activeMapId][param.name];
					});
				}
			});
	}

	arrayObjectIndexOf(myArray, searchTerm, property) {
		for (let i = 0, len = myArray.length; i < len; i++) {
			if (myArray[i][property] === searchTerm) {
				return i;
			}
		}
		return -1;
	}
}
