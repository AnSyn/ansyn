import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { IToolsState, toolsStateSelector } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { SetManualImageProcessing } from '../../actions/tools.actions';
import { IToolsConfig, toolsConfig } from '../../models/tools-config';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ImageManualProcessArgs } from '@ansyn/core/models/case.model';
import { IImageProcParam } from '@ansyn/menu-items/tools/models/tools-config';


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
		.do((imageManualProcessArgs) => this.imageManualProcessArgs = imageManualProcessArgs);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any> { ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	imageManualProcessArgs: ImageManualProcessArgs = this.defaultImageManualProcessArgs;

	@HostBinding('class.expand') @Input() expand;

	constructor(public store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig) {
	}

	resetOne(paramToReset) {
		this.updateParam(this.defaultImageManualProcessArgs[paramToReset], paramToReset.name);
	}

	updateParam(value, key) {
		const imageManualProcessArgs = { ...this.imageManualProcessArgs };
		imageManualProcessArgs[key] = value;
		this.store$.dispatch(new SetManualImageProcessing(imageManualProcessArgs));
	}

	resetParams() {
		this.store$.dispatch(new SetManualImageProcessing({ ...this.defaultImageManualProcessArgs }));
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
