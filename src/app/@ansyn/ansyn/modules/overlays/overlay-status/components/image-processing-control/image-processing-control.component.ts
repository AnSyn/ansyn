import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { IImageManualProcessArgs } from "../../../../menu-items/cases/models/case.model";
import {
	IImageProcessState,
	IOverlayStatusState,
	overlayStatusStateSelector
} from "../../reducers/overlay-status.reducer";
import { SetManualImageProcessing } from "../../actions/overlay-status.actions";
import { IImageProcParam, IOverlayStatusConfig, overlayStatusConfig } from "../../config/overlay-status-config";

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit, OnDestroy {

	private subscriptions: Subscription[] = [];

	imageManualProcessArgs: IImageManualProcessArgs = this.defaultImageManualProcessArgs;

	public manualImageProcessingParams$: Observable<Object> = this.store$.select(overlayStatusStateSelector).pipe(
		map((overlayStatusState: IOverlayStatusState) => overlayStatusState.manualImageProcessingParams),
		distinctUntilChanged(),
		filter(Boolean),
		tap((imageManualProcessArgs) => this.imageManualProcessArgs = imageManualProcessArgs)
	);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): IImageManualProcessArgs {
		return this.params.reduce<IImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	constructor(public store$: Store<IImageProcessState>, @Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
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
