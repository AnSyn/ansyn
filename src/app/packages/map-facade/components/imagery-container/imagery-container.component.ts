import { Component, ElementRef, Input, AfterViewInit, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { ImageryComponentSettings } from '@ansyn/imagery';
import { Spinner } from '@ansyn/core/utils/spinner';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() mapComponentSettings: ImageryComponentSettings;
	@Input() active: boolean;
	@Input('show-status') showStatus: boolean;

	@ViewChild('imageryViewContainer') imageryViewContainer: ElementRef;
	private _showSpinner: boolean;

	public get showSpinner(): boolean {
		return this._showSpinner;
	}

	public set showSpinner(value: boolean) {
		if (this._showSpinner === value) {
			return;
		}

		this._showSpinner = value;
		if (this._spinner) {
			if (this._showSpinner) {
				this._spinner.start("Loading...", 'transparent');//#EDEDED
			} else {
				this._spinner.stop();
			}
		}
	}

	private _spinner: Spinner;
	constructor() {
		this.showSpinner = false;
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		this._spinner = new Spinner(this.imageryViewContainer.nativeElement);
	}

	ngOnDestroy(): void {
		this._spinner = null;
	}
}
