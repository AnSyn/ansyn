import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { IImageManualProcessArgs } from '../../../../menu-items/cases/models/case.model';
import { selectOverlaysImageProcess } from '../../reducers/overlay-status.reducer';
import { LogManualImageProcessing, SetManualImageProcessing } from '../../actions/overlay-status.actions';
import { TranslateService } from '@ngx-translate/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { isEqual } from 'lodash';
import { OverlayStatusService } from '../../services/overlay-status.service';

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
@AutoSubscriptions()
export class ImageProcessingControlComponent implements OnInit, OnDestroy {
	@Input() overlayId: string;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	imageManualProcessArgs: IImageManualProcessArgs

	@AutoSubscription
	manualImageProcessingParams$: Observable<Object> = this.store$.pipe(
		select(selectOverlaysImageProcess),
		map((overlaysImageProcess) => overlaysImageProcess[this.overlayId]?.manuelArgs),
		distinctUntilChanged(isEqual),
		tap((imageManualProcessArgs) => {
			if (imageManualProcessArgs) {
				this.imageManualProcessArgs = imageManualProcessArgs;
			} else {
				this.imageManualProcessArgs = this.overlayStatusService.defaultImageManualProcessArgs
			}
		})
	);

	constructor(
		public store$: Store<any>,
		public overlayStatusService: OverlayStatusService,
		private translateService: TranslateService
	) {
	}

	resetOne(paramToReset) {
		this.updateParam(this.overlayStatusService.defaultImageManualProcessArgs[paramToReset.name], paramToReset.name);
	}

	updateParam(value, key) {
		const imageManualProcessArgs = { ...this.imageManualProcessArgs };
		imageManualProcessArgs[key] = value;
		this.store$.dispatch(new SetManualImageProcessing({ overlayId: this.overlayId, imageManualProcessArgs }));
	}

	log(changedArg: string) {
		this.store$.dispatch(new LogManualImageProcessing({ changedArg, allArgs: this.imageManualProcessArgs }));
	}

	resetParams() {
		const imageManualProcessArgs = this.overlayStatusService.defaultImageManualProcessArgs;
		this.store$.dispatch(new SetManualImageProcessing({ overlayId: this.overlayId, imageManualProcessArgs }));
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}
}
