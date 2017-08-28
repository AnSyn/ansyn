import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { OverlayTextComponent } from './components/overlay-text/overlay-text.component';
import { OverlayGeoRegistrationErrorComponent } from './components/overlay-geo-registration-error/overlay-geo-registration-error.component';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';




@NgModule({
	imports: [
		CommonModule,
		ToastModule,
	],
	providers: [GenericTypeResolverService],
	exports: [ToastModule, OverlayTextComponent, OverlayGeoRegistrationErrorComponent,AnsynCheckboxComponent],
	declarations: [OverlayTextComponent, OverlayGeoRegistrationErrorComponent, AnsynCheckboxComponent]
})

export class CoreModule { }
