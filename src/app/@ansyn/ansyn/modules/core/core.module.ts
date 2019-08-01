import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { LoggerService } from './services/logger.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { StorageService } from './services/storage/storage.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
import { ManualRemovedOverlaysComponent } from './components/manual-removed-overlays/manual-removed-overlays.component';
import { AnsynTranslationModule } from './translation/ansyn-translation.module';
import { AnsynFormsModule } from './forms/ansyn-forms.module';
import { FormsModule } from '@angular/forms';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { AngleFilterComponent } from './components/angle-filter/angle-filter.component';

@NgModule({
	imports: [
		CommonModule,
		AnsynFormsModule,
		TranslateModule,
		FormsModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService
	],
	exports: [
		AnsynTranslationModule,
		AnsynFormsModule,
		AnsynModalComponent,
		ManualRemovedOverlaysComponent,
		ContextMenuComponent
	],
	declarations: [
		AnsynModalComponent,
		ManualRemovedOverlaysComponent,
		ContextMenuComponent,
		AngleFilterComponent
	],
	entryComponents: [AngleFilterComponent]
})

export class CoreModule {

}
