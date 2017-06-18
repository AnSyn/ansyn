import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { ImageryComponentSettings } from '@ansyn/imagery';
import { SpinnerService, Spinner } from '@ansyn/loading-spinner';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less', '../../../loading-spinner/loading-spinner.less']
})
export class ImageryContainerComponent implements AfterViewInit {
	@Input() mapComponentSettings: ImageryComponentSettings;
	@Input() active: boolean;
	@Input('show-status') showStatus: boolean;

	@ViewChild('spinnerLoader') spinnerLoaderElement: ElementRef;

	private spinner: Spinner;
	constructor(private spinnerService: SpinnerService) {

	}

	ngAfterViewInit() {
		// '../../../loading-spinner/service/spinner.less',
		//this.spinnerLoaderElement.nativeElement.setAttribute('visibility', 'hidden');
		// this.spinner = this.spinnerService.provideSpinner(this.spinnerLoaderElement.nativeElement);
		// this.spinner.start('asaf', 'black');
	}


}
