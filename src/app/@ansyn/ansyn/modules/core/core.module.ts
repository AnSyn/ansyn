import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentTranslateLoader, DefaultTranslateLoader, AnsynTranslationModule } from '../../../translation/public_api';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { LoggerService } from './services/logger.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { StorageService } from './services/storage/storage.service';
import { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
import { ManualRemovedOverlaysComponent } from './components/manual-removed-overlays/manual-removed-overlays.component';
import { AnsynFormsModule } from './forms/ansyn-forms.module';
import { FormsModule } from '@angular/forms';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';

@NgModule({
	imports: [
		CommonModule,
		AnsynFormsModule,
		BrowserAnimationsModule,
		FormsModule,
		AnsynTranslationModule
	],
	providers: [
		GenericTypeResolverService,
		LoggerService,
		ErrorHandlerService,
		StorageService
	],
	exports: [
		AnsynFormsModule,
		AnsynModalComponent,
		ManualRemovedOverlaysComponent,
		ContextMenuComponent
	],
	declarations: [
		AnsynModalComponent,
		ManualRemovedOverlaysComponent,
		ContextMenuComponent
	]
})

export class CoreModule {

}
