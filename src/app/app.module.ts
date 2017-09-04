import { FilterMetadata, EnumFilterMetadata } from '@ansyn/menu-items/filters';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from './packages/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';

@NgModule({
	providers: [
		{ provide: FilterMetadata, useClass:EnumFilterMetadata, multi: true }
	],
	declarations: [
		AppComponent,
	],
	imports: [
		LoginModule.forRoot({authrizedPath: '/'}),
		AnsynModule,
		AppRoutingModule
	],
	bootstrap: [AppComponent]
})

export class AppModule {

}
