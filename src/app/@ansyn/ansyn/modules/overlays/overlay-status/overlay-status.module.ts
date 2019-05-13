import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MapFacadeModule } from "@ansyn/map-facade";
import { BackToBaseMapComponent } from './components/back-to-base-map/back-to-base-map.component';
import { OverlayStatusComponent } from "./overlay-status.component";

@NgModule({
	declarations: [OverlayStatusComponent, BackToBaseMapComponent],
	entryComponents: [OverlayStatusComponent, BackToBaseMapComponent],
	imports: [
		CommonModule,
		MapFacadeModule.provide({
			entryComponents: {
				status: [OverlayStatusComponent, BackToBaseMapComponent],
				container: []
			}
		})
	]
})
export class OverlayStatusModule {
}
