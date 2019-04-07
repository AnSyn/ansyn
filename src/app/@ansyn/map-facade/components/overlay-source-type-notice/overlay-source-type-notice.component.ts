import { Component, Inject, Input } from '@angular/core';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { IOverlay } from '../../../ansyn/modules/overlays/models/overlay.model';

@Component({
	selector: 'ansyn-overlay-source-type-notice',
	templateUrl: './overlay-source-type-notice.component.html',
	styleUrls: ['./overlay-source-type-notice.component.less']
})
export class OverlaySourceTypeNoticeComponent {

	@Input() set overlay(newOverlay: IOverlay) {
		let sourceTypeConfig;
		// Extract the title, according to the new overlay and the configuration
		this._title = newOverlay
			&& (sourceTypeConfig = this._config.sourceTypeNotices[newOverlay.sourceType])
			&& (sourceTypeConfig[newOverlay.sensorType] || sourceTypeConfig.Default);
		// Insert the photo year into the title, if requested
		if (this._title && newOverlay.date) {
			this._title = this._title.replace('$year', newOverlay.date.getFullYear().toString());
		}
	}

	private _title: string = null;
	get title() {
		return this._title;
	}

	constructor(@Inject(mapFacadeConfig) public _config: IMapFacadeConfig) {
	}

}
