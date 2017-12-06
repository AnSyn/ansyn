import { NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [DevReducer];

@NgModule({
	imports: [
		BrowserModule,
		StoreModule.forRoot({}, { metaReducers }),
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
