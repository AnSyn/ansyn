import { EnumFilterMetadata, FilterMetadata } from '@ansyn/menu-items/filters';
import { NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
	providers: [
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true }
	],
	declarations: [
		AppAnsynComponent,
	],
	exports: [AppAnsynComponent],
	imports: [
		StoreModule.forRoot({}),
		EffectsModule.forRoot([]),
		LoginModule,
		AnsynModule,
		AppRoutingModule
	],
	bootstrap: [AppAnsynComponent]
})

export class AppAnsynModule {

}
