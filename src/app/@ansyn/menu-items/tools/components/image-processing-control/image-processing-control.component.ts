import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { IToolsState, toolsStateSelector } from '../../reducers/tools.reducer';
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

	public manualImageProcessingParams$: Observable<Object> = this.store$.select(toolsStateSelector)
		.map((tools: IToolsState) => tools.manualImageProcessingParams)
		.distinctUntilChanged()
		.filter(Boolean)
		.do((imageManualProcessArgs) => {
			console.log(imageManualProcessArgs);
			this.imageManualProcessArgs = imageManualProcessArgs
		});

	get params() {
		return this.config.ImageProcParams;
	}

	get defaultValues(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any> {...initialObject, [imageProcParam.name]: imageProcParam.defaultValue }
		}, {});
	}


	imageManualProcessArgs: ImageManualProcessArgs = this.defaultValues;

	@HostBinding('class.expand') @Input() expand;

	constructor(public store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig) {
	}

	resetOne(name) {
		this.updateParam(name, this.params[name].defaultValue);
	}

	updateParam(value, key) {
		const imageManualProcessArgs = { ...this.imageManualProcessArgs };
		imageManualProcessArgs[key] = value;
		this.store$.dispatch(new SetManualImageProcessing(imageManualProcessArgs));
	}

	resetParams() {
		this.store$.dispatch(new SetManualImageProcessing(this.defaultValues));
	}

	ngOnInit(): void {
		this.subscriptions.push(
			this.manualImageProcessingParams$.subscribe()
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
