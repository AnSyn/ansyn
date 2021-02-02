import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';
import { LoggerService } from './services/logger.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { StorageService } from './services/storage/storage.service';
import { TranslateModule } from '@ngx-translate/core';
import { AnsynModalComponent } from './components/ansyn-modal/ansyn-modal.component';
import { AnsynTranslationModule } from './translation/ansyn-translation.module';
import { AnsynFormsModule } from './forms/ansyn-forms.module';
import { FormsModule } from '@angular/forms';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { AngleFilterComponent } from './components/angle-filter/angle-filter.component';
import { CredentialsComponent } from '../menu-items/credentials/components/credentials/credentials.component';
import { AreaToCredentialsService } from './services/credentials/area-to-credentials.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheInterceptorsService } from './services/http-request-cache/cache-interceptors.service';
import { CacheRequestService } from './services/http-request-cache/cache-request.service';
import { CredentialsService } from './services/credentials/credentials.service';

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
		StorageService,
		AreaToCredentialsService,
		CredentialsService,
		CacheRequestService,
		{ provide: HTTP_INTERCEPTORS, useClass: CacheInterceptorsService, multi: true}
	],
	exports: [
		AnsynTranslationModule,
		AnsynFormsModule,
		AnsynModalComponent,
		ContextMenuComponent,
		CredentialsComponent
	],
	declarations: [
		AnsynModalComponent,
		ContextMenuComponent,
		AngleFilterComponent,
		CredentialsComponent
	]
})

export class CoreModule {

}
