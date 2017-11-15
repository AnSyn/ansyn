import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';

const coreComponents = [
	AnsynCheckboxComponent,
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
