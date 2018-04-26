import { Component, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IToolsState, toolsStateSelector, selectSubMenu, SubMenuEnum } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { IImageProcParam, IToolsConfig, toolsConfig } from '../../models/tools-config';
import { toolsStateSelector } from '../../reducers/tools.reducer';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Subscription } from "rxjs/Subscription";
import { Observable } from 'rxjs/Observable';
import { ImageManualProcessArgs } from '@ansyn/core/models/case.model';


export interface IImageProcParamComp extends IImageProcParam {
	value: number;
}


@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit, OnDestroy {

	private subscriptions: Subscription[] = [];
	@Output() isActive = new EventEmitter<boolean>();

	public onManualProcessingExpand$ = this.store$.select(selectSubMenu)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([selectedSubMenu]: [SubMenuEnum, IMapState]) => selectedSubMenu === SubMenuEnum.manualImageProcessing)
		.do(([selectedSubMenu, mapState]: [SubMenuEnum, IMapState]) => {
			this.store$.dispatch(new SetMapManualImageProcessing({
				mapId: mapState.activeMapId,
				processingParams: this.imageManualProcessArgs
			}));
		})
		.distinctUntilChanged();

	public mapsImageProcessingState$ = this.store$.select(toolsStateSelector)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter((res: [IToolsState, IMapState]) => {
			const [toolsState, caseMapState]: [IToolsState, IMapState] = res;
			return Boolean(toolsState.imageProcessingHash) && Boolean(toolsState.imageProcessingHash[caseMapState.activeMapId])
		})
		.do((res: [IToolsState, IMapState]) => {
			const [toolsState, caseMapState]: [IToolsState, IMapState] = res;
			if (toolsState.imageProcessingHash[caseMapState.activeMapId] !== undefined) {
				this.params.forEach(param => {
					 this.imageManualProcessArgs[param.name] = toolsState.imageProcessingHash[caseMapState.activeMapId][param.name];
				});
			}
		});

	public manualImageProcessingParams$: Observable<Object> = this.store$.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.manualImageProcessingParams)
		.distinctUntilChanged()
		.do((imageManualProcessArgs) => {
			 this.imageManualProcessArgs = imageManualProcessArgs;
		});

	get params() {
		return this.config.ImageProcParams;
	}

	imageManualProcessArgs: ImageManualProcessArgs = {
		Sharpness: this.config.ImageProcParams.find((param) => param.name === 'Sharpness').defaultValue,
		Saturation: this.config.ImageProcParams.find((param) => param.name === 'Saturation').defaultValue,
		Gamma: this.config.ImageProcParams.find((param) => param.name === 'Gamma').defaultValue,
		Brightness: this.config.ImageProcParams.find((param) => param.name === 'Brightness').defaultValue,
		Contrast: this.config.ImageProcParams.find((param) => param.name === 'Contrast').defaultValue
	};

	@HostBinding('class.expand') @Input() expand;

	constructor(public store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig) {
	}

	resetOne(name) {
		this.updateParam(name, this.config.ImageProcParams[name].defaultValue);
	}

	updateParam(key, value) {
		const processingParams = { ...this.imageManualProcessArgs };
		processingParams[key] = value;
		this.store$.dispatch(new SetManualImageProcessing({ processingParams }));
	}

	resetParams() {
		const processingParams = { ...this.imageManualProcessArgs };
		this.config.ImageProcParams.forEach((imageProcParam) => {
			processingParams[imageProcParam.name] = imageProcParam.defaultValue;
		});
		this.store$.dispatch(new SetManualImageProcessing({ processingParams }));
	}

	ngOnInit(): void {
		this.resetParams();
		this.subscriptions.push(
			this.mapsImageProcessingState$.subscribe(),
			this.manualImageProcessingParams$.subscribe(),
			this.onManualProcessingExpand$.subscribe()
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}

// this.onManualProcessingExpand$.subscribe(),

// resetAllParamsAndEmit() {
// 	this.resetParams();
// 	this.manualImageProcess();
// 	this.isActive.emit(false);
// }

// this.params.forEach(param => {
// 	param.value = param.defaultValue;
// });


// manualProcessArgsFromParams(): ImageManualProcessArgs {
// 	const manualProcessArgs = {
// 		Sharpness: this.params[0].value,
// 		Contrast: this.params[1].value,
// 		Brightness: this.params[2].value,
// 		Gamma: this.params[3].value,
// 		Saturation: this.params[4].value
// 	};
// 	return manualProcessArgs;
// }

//
// const isChangeFromDefualt = this.params.some(({ value, defaultValue }) => value !== defaultValue);
// let dispatchValue = <ImageManualProcessArgs> {};
// if (isChangeFromDefualt) {
// 	this.params.forEach(param => {
// 		dispatchValue[param.name] = param.value;
// 	});
// }
// else {
// 	dispatchValue = undefined;
// }
// this.isActive.emit(isChangeFromDefualt);


// public onManualProcessingExpand$ = this.store$.select(selectSubMenu)
// 	.withLatestFrom(this.store$.select(mapStateSelector))
// 	.filter(([selectedSubMenu]: [SubMenuEnum, IMapState]) => selectedSubMenu === SubMenuEnum.manualImageProcessing)
// 	.do(([selectedSubMenu, mapState]: [SubMenuEnum, IMapState]) => {
// 		this.store$.dispatch(new SetMapManualImageProcessing({
// 			mapId: mapState.activeMapId,
// 			processingParams: this.manualProcessArgsFromParams()
// 		}));
// 	})
// 	.distinctUntilChanged();
