import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { AnsynCheckboxComponent } from './components/ansyn-checkbox/ansyn-checkbox.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { StoreModule } from '@ngrx/store';
import { coreFeatureKey, CoreReducer } from './reducers/core.reducer';
import { ToastComponent } from './components/toast/toast.component';
import { ProjectionConverterService } from './services/projection-converter.service';

const coreComponents = [
	AnsynCheckboxComponent,
	ImageryStatusComponent,
	PlaceholderComponent,
	ToastComponent
];

@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(coreFeatureKey, CoreReducer)
	],
	providers: [GenericTypeResolverService, ProjectionConverterService],
	exports: coreComponents,
	declarations: coreComponents
})

export class CoreModule {
}
