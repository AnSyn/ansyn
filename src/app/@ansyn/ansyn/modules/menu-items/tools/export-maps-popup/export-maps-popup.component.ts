import { Component, HostBinding, OnDestroy, OnInit, Inject } from '@angular/core';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store, select } from '@ngrx/store';
import {
	floationMenuExcludeClassNameForExport, imageryStatusExcludeClassNameForExport,
	selectIsMinimalistViewMode,
	SetMinimalistViewModeAction
} from '@ansyn/map-facade';
import { LoggerService } from '../../../core/services/logger.service';
import { filter, tap, debounceTime } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { toBlob } from 'dom-to-image';
import { MatDialogRef } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { toolsConfig, IToolsConfig } from '../models/tools-config';
import { annotationsExcludeClassNameForExport } from '@ansyn/ol';
import { measuresExcludeClassNameForExport } from '../../../plugins/openlayers/plugins/visualizers/tools/measure-distance.visualizer';

const LOGS = {
	request: 'Request to export maps',
	failed: 'Export maps failed',
	success: 'Export maps success',
	canceled: 'Export maps was canceled'
};

const DEFAULT_QUALITY = 'normal';
const DEFAULT_PAGE_SIZE = 'a4';

const item2class = {
	'draws and measurements': [annotationsExcludeClassNameForExport, measuresExcludeClassNameForExport],
	'north point': floationMenuExcludeClassNameForExport,
	'description': imageryStatusExcludeClassNameForExport
};

@Component({
	selector: 'ansyn-export-maps-popup',
	templateUrl: './export-maps-popup.component.html',
	styleUrls: ['./export-maps-popup.component.less']
})
@AutoSubscriptions()
export class ExportMapsPopupComponent implements OnInit, OnDestroy{
	@HostBinding('style.direction') direction: 'rtl' | 'ltr';
	title = 'Export';
	description = 'keep in mind that the image may be protected';
	exportMethod: 'basic' | 'advanced' = 'basic';
	graphicExport = ['all', 'draws and measurements', 'north point', 'description'];
	graphicexportMap = new Map(this.graphicExport.reduce( (entries: Array<[string, boolean]>, e) => {
			entries.push([e, true]);
			return entries;
	}, []));
	formats = ['JPG (Screenshot)', 'PDF'];
	format = this.formats[0];
	_pageSize = DEFAULT_PAGE_SIZE;
	_pageSizes = {a0: [1189, 841], a1: [841, 594], a2: [594, 420], a3: [420, 297], a4: [297, 210], a5: [210, 148]};
	quality = DEFAULT_QUALITY;
	_qualities = { low: 72, normal: 150, high: 300 };

	get pageSize() {
		if (this.isPDF()) {
			return this._pageSize;
		}
		return 'Screenshot';
	}

	set pageSize(value) {
		this._pageSize = value
	}

	get pageSizes() {
		if (this.isPDF()) {
			return Object.keys(this._pageSizes);
		}
		return ['Screenshot']
	}
	get qualities() {
		return Object.keys(this._qualities);
	}

	get config() {
		return this.toolsConfigData.exportMap;
	}

	@AutoSubscription
	isMinimalView$ = this.store$.pipe(
		select(selectIsMinimalistViewMode),
		filter(Boolean),
		debounceTime(100),
		tap( this.exportMapsToPng.bind(this))
	);

	constructor(protected store$: Store<any>,
				protected logger: LoggerService,
				protected dialogRef: MatDialogRef<ExportMapsPopupComponent>,
				@Inject(DOCUMENT) protected document: any,
				@Inject(toolsConfig) public toolsConfigData: IToolsConfig) {
		this.logger.info(LOGS.request);
	}
	ngOnInit(): void {
	}
	ngOnDestroy(): void {
	}

	exportMapsToPng() {
		const excludeClasses = [...this.config.excludeClasses];
		if (this.exportMethod === 'advanced' && this.format === this.formats[0]) {
			this.graphicexportMap.forEach( (show, key) => {
				if (!show && item2class[key]) {
					let excludeClass = item2class[key];
					if (!Array.isArray(excludeClass)) {
						excludeClass = [excludeClass];
					}
					excludeClasses.push(...excludeClass);
				}
			})
		}
		toBlob(document.querySelector(this.config.target), {
			filter: (element) => {
				if (element.tagName === 'CANVAS') {
					return element.width > 0;
				}
				return !(element.classList && excludeClasses.some( excludeClass => element.classList.contains(excludeClass)));
			}
		}).then(blob => {
			this.store$.dispatch(new SetMinimalistViewModeAction(false));
			saveAs(blob, 'map.jpg');
		}).catch( err => {
			this.logger.error(LOGS.failed);
		}).finally( () => {this.dialogRef.close()});
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
		this._pageSize = DEFAULT_PAGE_SIZE;
	}

	export() {
		if (this.exportMethod === 'basic' || this.format === this.formats[0]) {
			this.store$.dispatch(new SetMinimalistViewModeAction(true));
		}
		else {
			// advanced export

		}
	}

	private isPDF() {
		return this.format === this.formats[1];
	}
}
