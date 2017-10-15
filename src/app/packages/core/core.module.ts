import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { OverlayGeoRegistrationErrorComponent } from './components/overlay-geo-registration-error/overlay-geo-registration-error.component';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { OverlaysStatusNotificationsComponent } from './components/overlays-status-notifications/overlays-status-notifications.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';

const coreComponents = [
	OverlayGeoRegistrationErrorComponent,
	AnsynCheckboxComponent,
	OverlaysStatusNotificationsComponent,
	ImageryStatusComponent
];

@NgModule({
	imports: [
		CommonModule,
		ToastModule,
	],
	providers: [GenericTypeResolverService],
	exports: [ToastModule, ...coreComponents],
	declarations: [...coreComponents]
})

export class CoreModule {
}
