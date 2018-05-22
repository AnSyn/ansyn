import { Component, Input } from '@angular/core';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { IOverlaysConfig } from '@ansyn/overlays/models/overlays.config';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Component({
	selector: 'ansyn-overlay-source-type-notice',
	templateUrl: './overlay-source-type-notice.component.html',
	styleUrls: ['./overlay-source-type-notice.component.less']
})
export class OverlaySourceTypeNoticeComponent {

	@Input()  set overlay(newOverlay: Overlay) {
		let sourceTypeConfig;
		this._title = newOverlay
			&& (sourceTypeConfig = this._config.sourceTypeNotices[newOverlay.sourceType])
			&& (sourceTypeConfig[newOverlay.sensorType] || sourceTypeConfig.Default);
	}

	private _title: string = null;
	get title() {
		return this._title;
	}

	private _config: IOverlaysConfig;

	constructor(overlaysService: OverlaysService) {
		this._config = overlaysService.config;
	}

}
