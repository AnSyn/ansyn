import { Component, Input, OnChanges } from '@angular/core';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig, KeyAndValue } from '@ansyn/overlays/models/overlays.config';
import { OverlaysService } from '@ansyn/overlays';

@Component({
	selector: 'ansyn-overlay-copyright-notice',
	templateUrl: './overlay-copyright-notice.component.html',
	styleUrls: ['./overlay-copyright-notice.component.less']
})
export class OverlayCopyrightNoticeComponent implements OnChanges {

	@Input()  set overlay(newOverlay: Overlay) {
		if (newOverlay) {
			const keyAndValue: KeyAndValue = this._config.titlesForMapSourceTypes.find(keyAndValue => keyAndValue.key === newOverlay.sourceType);
			if (keyAndValue) {
				this._title = keyAndValue.value;
			// } else { // for testing
			// 	this._title = newOverlay.sourceType;
			}
		}
	}

	private _title: string = null;
	get title() {
		return this._title;
	}

	private _config: IOverlaysConfig;

	constructor(overlaysService: OverlaysService) {
		this._config = overlaysService.config;
	}

	ngOnChanges() {

	}

}
