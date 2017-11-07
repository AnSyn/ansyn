import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { OverlaysStatusNotificationsComponent } from './components/overlays-status-notifications/overlays-status-notifications.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';

const coreComponents = [
	AnsynCheckboxComponent,
	OverlaysStatusNotificationsComponent,
	ImageryStatusComponent,
	PlaceholderComponent
];


@NgModule({
	imports: [
		CommonModule,
		ToastModule
	],
	providers: [GenericTypeResolverService],
	exports: [ToastModule, ...coreComponents],
	declarations: [...coreComponents]
})

export class CoreModule {
}
