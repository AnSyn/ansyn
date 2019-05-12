import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MapFacadeModule } from "@ansyn/map-facade";
import { OverlayStatusComponent } from "./overlay-status/overlay-status.component";

@NgModule({
	declarations: [OverlayStatusComponent],
	entryComponents: [OverlayStatusComponent],
	imports: [
		CommonModule,
		MapFacadeModule.provide({
			entryComponents: {
				status: [OverlayStatusComponent],
				container: []
			}
		})
	]
})
export class OverlayStatusModule {
}
