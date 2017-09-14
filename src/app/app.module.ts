import { EnumFilterMetadata, FilterMetadata } from '@ansyn/menu-items/filters';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';

@NgModule({
	providers: [
		{provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true}
	],
	declarations: [
		AppComponent,
	],
	imports: [
		LoginModule,
		AnsynModule,
		AppRoutingModule
	],
	bootstrap: [AppComponent]
})

export class AppModule {

}
