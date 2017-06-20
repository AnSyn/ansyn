import { Component, ElementRef, Input, AfterViewInit, ViewChild, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ImageryComponentSettings } from '@ansyn/imagery';
import { ImageryCommunicatorService } from '../../../imagery/communicator-service/communicator.service';
//import { SpinnerService, Spinner } from '@ansyn/loading-spinner';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less', '../../../loading-spinner/loading-spinner.less']
})
export class ImageryContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() mapComponentSettings: ImageryComponentSettings;
	@Input() active: boolean;
	@Input('show-status') showStatus: boolean;

	// @ViewChild('spinnerLoader') spinnerLoaderElement: ElementRef;
    //
	// private spinner: Spinner;
	@Input()
	public showSpinner: boolean;
	constructor(private cdRef: ChangeDetectorRef,
				private imageryCommunicatorService: ImageryCommunicatorService/*private spinnerService: SpinnerService*/) {
		this.showSpinner = false;
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}

	ngOnDestroy(): void {
	}
}
