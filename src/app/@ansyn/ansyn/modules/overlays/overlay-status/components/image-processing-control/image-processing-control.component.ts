import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { toolsStateSelector } from "../../../../menu-items/tools/reducers/tools.reducer";
import { IImageProcParam, IToolsConfig, toolsConfig } from "../../../../menu-items/tools/models/tools-config";
import { ImageManualProcessArgs } from "../../../../menu-items/cases/models/case.model";
import { SetManualImageProcessing } from "../../../../menu-items/tools/actions/tools.actions";
import { IImageProcessState } from "../../reducers/overlay-status.reducer";

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit, OnDestroy {

	private subscriptions: Subscription[] = [];

	public manualImageProcessingParams$: Observable<Object> = this.store$.select(toolsStateSelector).pipe(
		map((tools: IImageProcessState) => tools.manualImageProcessingParams),
		distinctUntilChanged(),
		filter(Boolean),
		tap((imageManualProcessArgs) => this.imageManualProcessArgs = imageManualProcessArgs)
	);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	imageManualProcessArgs: ImageManualProcessArgs = this.defaultImageManualProcessArgs;


	constructor(public store$: Store<IImageProcessState>, @Inject(toolsConfig) protected config: IToolsConfig) {
	}

	resetOne(paramToReset) {
		this.updateParam(this.defaultImageManualProcessArgs[paramToReset.name], paramToReset.name);
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
