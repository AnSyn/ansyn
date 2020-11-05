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
import { LogManualImageProcessing, SetManualImageProcessing } from '../../actions/overlay-status.actions';
import { IImageProcParam, IOverlayStatusConfig, overlayStatusConfig } from "../../config/overlay-status-config";
import { OverlaysService } from '../../../services/overlays.service';

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent implements OnInit, OnDestroy {

	private subscriptions: Subscription[] = [];

	public manualImageProcessingParams$: Observable<Object> = this.store$.select(overlayStatusStateSelector).pipe(
		map((overlayStatusState: IOverlayStatusState) => overlayStatusState.manualImageProcessingParams),
		distinctUntilChanged(),
		filter(Boolean),
		tap((imageManualProcessArgs) => this.imageManualProcessArgs = imageManualProcessArgs)
	);

	defaultImageManualProcessArgs: IImageManualProcessArgs = this.overlayService.defaultImageManualProcessArgs;
	imageManualProcessArgs: IImageManualProcessArgs = this.defaultImageManualProcessArgs;
	params: Array<IImageProcParam> = this.overlayService.params;

	constructor(private overlayService: OverlaysService,
				public store$: Store<IImageProcessState>, 
				@Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
	}

	resetOne(paramToReset) {
		this.updateParam(this.defaultImageManualProcessArgs[paramToReset.name], paramToReset.name);
	}

	updateParam(value, key) {
		const imageManualProcessArgs = { ...this.imageManualProcessArgs };
		imageManualProcessArgs[key] = value;
		this.store$.dispatch(new SetManualImageProcessing(imageManualProcessArgs));
	}

	log(changedArg: string) {
		this.store$.dispatch(new LogManualImageProcessing({ changedArg, allArgs: this.imageManualProcessArgs }));
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
