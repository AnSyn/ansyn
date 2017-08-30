import { Component, ElementRef, Input, AfterViewInit, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Spinner } from '@ansyn/core/utils';
import { CaseMapState, Overlay } from '@ansyn/core';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input('disable-geo-options') disableGeoOptions: boolean;
	@Input('map-state') mapState: CaseMapState;
	@Input() active: boolean;
	@Input('show-status') showStatus: boolean;

	@ViewChild('imageryViewContainer') imageryViewContainer: ElementRef;
	private _showSpinner: boolean;

	@Input("showSpinner")
	public set showSpinner(value: boolean) {
		if (this._showSpinner === value) {
			return;
		}
		this._showSpinner = value;
		this.toggleSpinner();
	}

	public get showSpinner(): boolean {
		return this._showSpinner;
	}

	get overlay(): Overlay {
		return this.mapState.data.overlay;
	}

	private _spinner: Spinner;
	constructor() {
		this.showSpinner = true;
	}

	ngOnInit() {
	}

	toggleSpinner() {
		if (this._spinner) {
			if (this._showSpinner) {
				this._spinner.start("Loading...", 'transparent');//#EDEDED
			} else {
				this._spinner.stop();
			}
		}
	}

	ngAfterViewInit() {
		this._spinner = new Spinner(this.imageryViewContainer.nativeElement);
		this.toggleSpinner();
	}

	ngOnDestroy(): void {
		this._spinner = null;
	}
}
