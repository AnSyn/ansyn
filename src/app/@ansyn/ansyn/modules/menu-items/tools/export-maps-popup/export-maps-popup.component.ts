import { Component, HostBinding, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AutoSubscriptions } from 'auto-subscriptions';
import { ImageryCommunicatorService } from '@ansyn/imagery';

const LOGS = {
	request: 'Request to export maps',
	failed: 'Export maps failed',
	success: 'Export maps success',
	canceled: 'Export maps was canceled'
};

const DEFAULT_QUALITY = 'normal';
const DEFAULT_PAGE_SIZE = 'a4';

@Component({
	selector: 'ansyn-export-maps-popup',
	templateUrl: './export-maps-popup.component.html',
	styleUrls: ['./export-maps-popup.component.less']
})
export class ExportMapsPopupComponent {
	@HostBinding('style.direction') direction: 'rtl' | 'ltr';
	title = 'Export';
	description = 'keep in mind that the image may be protected';
	exportMethod: 'basic' | 'advanced' = 'basic';
	graphicExport = ['all', 'draws and annotations', 'north point', 'description'];
	graphicexportMap = new Map(this.graphicExport.reduce( (entries: Array<[string, boolean]>, e) => {
			entries.push([e, true]);
			return entries;
	}, []));
	formats = ['JPG (Screenshot)', 'PDF'];
	format = this.formats[0];
	pageSize = DEFAULT_PAGE_SIZE;
	pageSizes = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5'];
	quality = DEFAULT_QUALITY;
	_qualities = { low: 72, normal: 150, high: 300 };

	get qualities() {
		return Object.keys(this._qualities);
	}

	constructor(protected communicatorService: ImageryCommunicatorService) {

	}

	graphicExportChange(ge: string, forceState = false) {
		const newState = forceState || !this.graphicexportMap.get(ge);
		if (ge !== 'all') {
			this.graphicexportMap.set(ge, newState);
			let notAllCheck = !newState;
			this.graphicexportMap.forEach( (g, key) => {
				notAllCheck = notAllCheck || (key !== 'all' && !g)
			});
			this.graphicexportMap.set('all', !notAllCheck);

		}
		else {
			this.graphicexportMap.forEach( (_, key, map) => map.set(key, newState))
		}
	}

	reset() {
		this.graphicExportChange('all', true);
		this.format = this.formats[0];
		this.quality = DEFAULT_QUALITY;
		this.pageSize = DEFAULT_PAGE_SIZE;
	}

	export() {
		if (this.exportMethod === 'basic') {

		}
	}
}
