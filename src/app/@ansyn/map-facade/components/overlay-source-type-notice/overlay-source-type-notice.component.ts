import { Component, Input, OnChanges } from '@angular/core';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig, KeyAndValue } from '@ansyn/overlays/models/overlays.config';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Component({
	selector: 'ansyn-overlay-source-type-notice',
	templateUrl: './overlay-source-type-notice.component.html',
	styleUrls: ['./overlay-source-type-notice.component.less']
})
export class OverlaySourceTypeNoticeComponent implements OnChanges {

	@Input()  set overlay(newOverlay: Overlay) {
		if (newOverlay) {
			const keyAndValue: KeyAndValue = this._config.sourceTypeNotices.find(keyAndValue => keyAndValue.key === newOverlay.sourceType);
			if (keyAndValue) {
				this._title = keyAndValue.value;
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
