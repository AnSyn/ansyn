import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { select, Store } from '@ngrx/store';
import {
	floationMenuExcludeClassNameForExport,
	imageryStatusExcludeClassNameForExport, selectActiveMapId,
	selectIsMinimalistViewMode,
	SetMinimalistViewModeAction
} from '@ansyn/map-facade';
import { LoggerService } from '../../../core/services/logger.service';
import { debounceTime, filter, tap, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { toBlob } from 'dom-to-image';
import { MatDialogRef } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { IToolsConfig, toolsConfig } from '../models/tools-config';
import { annotationsExcludeClassNameForExport } from '@ansyn/ol';
import { measuresExcludeClassNameForExport } from '../../../plugins/openlayers/plugins/visualizers/tools/measure-distance.visualizer';
import { IExportMapMetadata, ImageryCommunicatorService, toDegrees } from '@ansyn/imagery';
import { jsPDF } from "jspdf";
import { TranslateService } from '@ngx-translate/core';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { bindCallback, Observable } from 'rxjs';

enum GraphicExportEnum {
	All = 'All',
	DrawsAndMeasures = 'Draws & Measurements',
	North = 'North point',
	Description = 'Description'
}

enum ExportMethodEnum {
	BASIC = 'Basic',
	ADVANCED = 'Advanced'
}

enum FormatEnum {
	JPG = 'JPG (Screenshot)',
	PDF = 'PDF'
}
const LOGS = {
	request: 'Request to export maps',
	failed: 'Export maps failed',
	success: 'Export maps success',
	canceled: 'Export maps was canceled'
};

const DEFAULT_QUALITY = 'normal';
const DEFAULT_PAGE_SIZE = 'a4';

const item2class = {
	[GraphicExportEnum.DrawsAndMeasures]: [annotationsExcludeClassNameForExport, measuresExcludeClassNameForExport],
	[GraphicExportEnum.North]: floationMenuExcludeClassNameForExport,
	[GraphicExportEnum.Description]: imageryStatusExcludeClassNameForExport
};

@Component({
	selector: 'ansyn-export-maps-popup',
	templateUrl: './export-maps-popup.component.html',
	styleUrls: ['./export-maps-popup.component.less']
})
@AutoSubscriptions()
export class ExportMapsPopupComponent implements OnInit, OnDestroy {
	@HostBinding('style.direction') direction: 'rtl' | 'ltr';
	readonly basicExport = ExportMethodEnum.BASIC;
	readonly advancedExport = ExportMethodEnum.ADVANCED
	readonly pdfFormat = FormatEnum.PDF;
	readonly jpgFormat = FormatEnum.JPG;

	title = 'Export';
	description = 'keep in mind that the image may be protected';
	exportMethod: ExportMethodEnum = ExportMethodEnum.BASIC;
	pdfExportMapId: string;
	graphicExport = [GraphicExportEnum.All, GraphicExportEnum.DrawsAndMeasures, GraphicExportEnum.North, GraphicExportEnum.Description];
	graphicexportMap = new Map(this.graphicExport.reduce((entries: Array<[string, boolean]>, e) => {
		entries.push([e, true]);
		return entries;
	}, []));
	formats = [FormatEnum.JPG, FormatEnum.PDF];
	format = this.formats[0];
	quality = DEFAULT_QUALITY;

	@AutoSubscription
	onActiveMapChange$ = this.store$.pipe(
		select(selectActiveMapId),
		tap( (activeMapId) => this.pdfExportMapId = activeMapId)
	);
	@AutoSubscription
	basicExport$ = this.store$.pipe(
		select(selectIsMinimalistViewMode),
		filter(Boolean),
		debounceTime(100),
		tap(this.basicExportMap.bind(this))
	);

	_pageSize = DEFAULT_PAGE_SIZE;

	get pageSize() {
		if (this.isPDF()) {
			return this._pageSize;
		}
		return 'Screenshot';
	}

	set pageSize(value) {
		this._pageSize = value
	}

	_pageSizes = { a0: [1189, 841], a1: [841, 594], a2: [594, 420], a3: [420, 297], a4: [297, 210], a5: [210, 148] };

	get pageSizes() {
		if (this.isPDF()) {
			return Object.keys(this._pageSizes);
		}
		return ['Screenshot']
	}

	_qualities = { low: 72, normal: 150, high: 300 };

	get qualities() {
		return Object.keys(this._qualities);
	}

	get config() {
		return this.toolsConfigData.exportMap;
	}

	constructor(protected store$: Store<any>,
				protected logger: LoggerService,
				protected dialogRef: MatDialogRef<ExportMapsPopupComponent>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected translateService: TranslateService,
				@Inject(DOCUMENT) protected document: any,
				@Inject(toolsConfig) public toolsConfigData: IToolsConfig) {
		this.logger.info(LOGS.request);
		this.translateService.get('direction', '').subscribe( (direction) => this.direction = direction === 'rtl' ? 'rtl' : 'ltr')
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	advancedExportMaps(exportMetadata: IExportMapMetadata) {
		const mapToBeExport = this.imageryCommunicatorService.provide(this.pdfExportMapId);

		if (!mapToBeExport) {
			throw new Error('No Such Map Error');
		}


		mapToBeExport.exportMap(exportMetadata).pipe(
			map( (mapData) => {
				if (exportMetadata.extra.north) {
					return new Observable( obs => {
						const rotation = mapToBeExport.mapSettings.data.position.projectedState.rotation;
						const rotationInDeg = toDegrees(rotation);
						const northImage = new Image(90, 90);
						northImage.onload = function() {
							const context = mapData.canvas.getContext('2d');
							context.drawImage(northImage, 10, 20);
						}
						northImage.src = 'assets/icons/full-north.svg';
					})
				}
				return mapData;
			})
		)
		mapToBeExport.exportMap(exportMetadata).subscribe( (exportMap) => {
			const {size, extra} = exportMetadata;
			const doc = new jsPDF('landscape', undefined, this.pageSize);
			doc.addImage(exportMap.canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, exportMetadata.size[0], exportMetadata.size[1]);
			if (extra.descriptions) {
				doc.rect(0, 0, size[0], 5, 'F');
				doc.setTextColor(255, 255, 255);
				doc.setFontSize(11);
				const loadOverlay = mapToBeExport.mapSettings.data.overlay;
				const desc = Boolean(loadOverlay) ? this.getDescriptionFromOverlay(loadOverlay) : 'Base Map';
				doc.text(desc, size[0] / 2, 5, {align: 'center', baseline: 'bottom'});
			}
			if ( extra.north) {
				const rotation = mapToBeExport.mapSettings.data.position.projectedState.rotation;
				console.log({rotation});
				const rotationInDeg = toDegrees(rotation);
				const northImage = new Image(90, 90);
				northImage.onload = function () {
					doc.addImage(northImage, 'JPEG', size[0] / 2, size[1] / 2, 26, 26, 'compass', 0, rotationInDeg);
					doc.save('map.pdf');
				}
				northImage.src = 'assets/icons/full-north.svg';
			}else {
				doc.save('map.pdf');
			}
			this.dialogRef.close();
			}
		);
	}

	basicExportMap() {
		toBlob(document.querySelector(this.config.target), {
			filter: this.filterExcludeClass(),
		}).then(blob => {
			this.store$.dispatch(new SetMinimalistViewModeAction(false));
			saveAs(blob, 'map.jpg');
		}).catch(err => {
			this.logger.error(LOGS.failed);
		}).finally(() => {
			this.dialogRef.close()
		});
	}

	graphicExportChange(ge: string, forceState = false) {
		const newState = forceState || !this.graphicexportMap.get(ge);
		if (ge !== GraphicExportEnum.All) {
			this.graphicexportMap.set(ge, newState);
			let notAllCheck = !newState;
			this.graphicexportMap.forEach((g, key) => {
				notAllCheck = notAllCheck || (key !== GraphicExportEnum.All && !g)
			});
			this.graphicexportMap.set(GraphicExportEnum.All, !notAllCheck);

		} else {
			this.graphicexportMap.forEach((_, key, map) => map.set(key, newState))
		}
	}

	reset() {
		this.graphicExportChange('all', true);
		this.format = this.formats[0];
		this.quality = DEFAULT_QUALITY;
		this._pageSize = DEFAULT_PAGE_SIZE;
	}

	export() {
		const exportMetadata: IExportMapMetadata = this.getExportMetadata();
		if (this.exportMethod === ExportMethodEnum.BASIC || this.format === this.formats[0]) {
			this.store$.dispatch(new SetMinimalistViewModeAction(true));
		} else {
			this.advancedExportMaps(exportMetadata);
		}
	}

	private getExportMetadata(): IExportMapMetadata {
		const annotations = this.graphicexportMap.get(GraphicExportEnum.DrawsAndMeasures) ?
			item2class[GraphicExportEnum.DrawsAndMeasures].map( (layerName) => `.${layerName} canvas`).join(',') : false;
		return {
			size: this._pageSizes[this._pageSize],
			resolution: this._qualities[this.quality],
			extra: {
				north: this.graphicexportMap.get(GraphicExportEnum.North),
				annotations,
				descriptions: this.graphicexportMap.get(GraphicExportEnum.Description)
			}
		}
	}

	private isPDF() {
		return this.format === FormatEnum.PDF;
	}

	private filterExcludeClass() {
		const excludeClasses = [...this.config.excludeClasses];
		if (this.exportMethod === ExportMethodEnum.ADVANCED && this.format === this.formats[0]) {
			this.graphicexportMap.forEach((show, key) => {
				if (!show && item2class[key]) {
					let excludeClass = item2class[key];
					if (!Array.isArray(excludeClass)) {
						excludeClass = [excludeClass];
					}
					excludeClasses.push(...excludeClass);
				}
			})
		}
		return function(element) {
			if (element.tagName === 'CANVAS') {
				return element.width > 0;
			}
			return !(element.classList && excludeClasses.some(excludeClass => element.classList.contains(excludeClass)));
		}
	}

	private getDescriptionFromOverlay(overlay: IOverlay) {
		const time = overlay.date;
		const sensorName = overlay.sensorName;
		return `${sensorName} ${time.toLocaleString()}`;
	}
}
