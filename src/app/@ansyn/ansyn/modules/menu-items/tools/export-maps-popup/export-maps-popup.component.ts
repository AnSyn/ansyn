import { Component } from '@angular/core';
import { MapFacadeService } from '@ansyn/map-facade';
import { MatDialogRef } from '@angular/material/dialog';
import { CredentialsService } from '../../../core/services/credentials/credentials.service';

@Component({
	selector: 'ansyn-export-maps-popup',
	templateUrl: './export-maps-popup.component.html',
	styleUrls: ['./export-maps-popup.component.less']
})
export class ExportMapsPopupComponent {
	title = "Notice";
	description = "Your image is in process, keep in mind that the image may be protected.";

	constructor(
		public credentialsService: CredentialsService,
		public dialogRef: MatDialogRef<ExportMapsPopupComponent>,
		protected mapFacadeService: MapFacadeService) {}

	exportMapsToPng() {
		this.mapFacadeService.exportMapsToPng();
		this.closeModal();
	}

	closeModal(): void {
		this.dialogRef.close();
	}

}
