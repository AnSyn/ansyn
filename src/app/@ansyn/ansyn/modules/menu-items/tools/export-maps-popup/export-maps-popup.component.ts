import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CredentialsService } from '../../../core/services/credentials/credentials.service';
import { DOCUMENT } from '@angular/common';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { saveAs } from 'file-saver';
import { IToolsConfig, toolsConfig } from '../models/tools-config';
import { Store } from '@ngrx/store';
import { selectIsMinimalistViewMode, SetMinimalistViewModeAction } from '@ansyn/map-facade';
import { LoggerService } from '../../../core/services/logger.service';
import { toBlob } from 'dom-to-image';

const LOGS = {
	request: 'Request to export maps',
	failed: 'Export maps failed',
	success: 'Export maps success',
	canceled: 'Export maps was canceled'
};

@Component({
	selector: 'ansyn-export-maps-popup',
	templateUrl: './export-maps-popup.component.html',
	styleUrls: ['./export-maps-popup.component.less']
})
@AutoSubscriptions()
export class ExportMapsPopupComponent implements OnInit, OnDestroy {
	title = 'Notice';
	description = 'Your image is in process, keep in mind that the image may be protected.';
	mapBlob = new EventEmitter<Blob>();
	onClick = new EventEmitter<boolean>();
	isDownloadAvailable = false;

	@AutoSubscription
	onMapReadyToExport$ = combineLatest(this.mapBlob, this.onClick).pipe(
		tap(([blob, isExport]: [Blob, boolean]) => {
			if (isExport) {
				saveAs(blob, 'map.jpg');
				this.logger.info(LOGS.success);
			}
			else {
				this.logger.info(LOGS.canceled);
			}
			this.closeModal()
		})
	);

	@AutoSubscription
	isMinimalView$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		filter(Boolean),
		tap( this.exportMapsToPng.bind(this))
	);

	get config() {
		return this.toolsConfigData.exportMap;
	}

	constructor(
		public store$: Store<any>,
		public credentialsService: CredentialsService,
		public dialogRef: MatDialogRef<ExportMapsPopupComponent>,
		protected logger: LoggerService,
		@Inject(DOCUMENT) protected document: any,
		@Inject(toolsConfig) public toolsConfigData: IToolsConfig) {
		this.logger.info(LOGS.request);
		this.store$.dispatch(new SetMinimalistViewModeAction(true));
	}

	exportMapsToPng() {
		toBlob(document.querySelector(this.config.target), {
			filter: (element) => !(element.classList && this.config.excludeClasses.some( excludeClass => element.classList.contains(excludeClass)))
		}).then(blob => {
			this.store$.dispatch(new SetMinimalistViewModeAction(false));
			this.isDownloadAvailable = true;
			this.mapBlob.emit(blob)
		}).catch( err => {
			this.logger.error(LOGS.failed);
			this.closeModal();
		});
	}

	closeModal(): void {

		this.dialogRef.close();
	}

	ngOnDestroy(): void {
	}

	ngOnInit(): void {
	}

}
