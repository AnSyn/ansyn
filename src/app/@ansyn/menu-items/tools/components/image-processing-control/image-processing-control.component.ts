import { Component, EventEmitter, HostBinding, Inject, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { IToolsConfig, toolsConfig } from '../../models';
import { IImageProcParam } from '../../models/tools-config';
import { ImageManualProcessArgs } from '@ansyn/core';
import { toolsStateSelector } from '../../reducers/tools.reducer';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Subscription } from "rxjs/Subscription";
import { IMapState } from "@ansyn/map-facade";
import { Observable } from 'rxjs/Observable';


export interface IImageProcParamComp extends IImageProcParam {
	value: number;
}


@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit, OnDestroy {

	private _isExpended: boolean;

	private subscriptions: Subscription[] = [];


	public mapsImapgeProcessingState =	this.store$.select(toolsStateSelector)
		.withLatestFrom(<Observable<IMapState>>this.store$.select(mapStateSelector))
		.do((res: [IToolsState , IMapState])   =>
		{
			const [toolsState, caseMapState]: [IToolsState , IMapState] = res;
			if (toolsState.imageProcessingHash[caseMapState.activeMapId] !== undefined) {
				this.params.forEach(param => {
					this.params[this.params.findIndex((x) => x.name === param.name)].value = toolsState.imageProcessingHash[caseMapState.activeMapId][param.name];
				});
			}
		});


	params: Array<IImageProcParamComp> = this.config.ImageProcParams.map(param => {
		return { ...param, value: param.defaultValue };
	});

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
		this.subscriptions.push(this.mapsImapgeProcessingState.subscribe());
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
