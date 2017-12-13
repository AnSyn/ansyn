import { ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { GlobalErrorHandler } from '@ansyn/core/utils/global-error-handler';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

@NgModule({
	imports: [
		BrowserModule,
		StoreModule.forRoot({}, { metaReducers }),
		EffectsModule.forRoot([]),
		LoginModule,
		AnsynModule,
		AppRoutingModule,
	],
	providers: [
		{
			provide: ErrorHandler,
			useClass: GlobalErrorHandler
		}
	],
	declarations: [AppAnsynComponent],
	exports: [AppAnsynComponent],
	bootstrap: [AppAnsynComponent]
})

export class AppAnsynModule {

}
