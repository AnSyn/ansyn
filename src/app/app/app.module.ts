import { NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
	imports: [
		BrowserModule,
		StoreModule.forRoot({}),
		EffectsModule.forRoot([]),
		LoginModule,
		AnsynModule,
		AppRoutingModule
	],
	declarations: [AppAnsynComponent],
	exports: [AppAnsynComponent],
	bootstrap: [AppAnsynComponent]
})

export class AppAnsynModule {

}
