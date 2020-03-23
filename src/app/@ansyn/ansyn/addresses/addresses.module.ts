import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AddressesService } from "./services/addresses.service";
import { AddressesConfig, AddressesConfigService } from "./services/addresses-config.service";
import { IAddressesConfig } from "./models/addresses.config";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule
	],
	providers: [AddressesService, AddressesConfigService]
})

export class AddressModule {
	static forRoot(config: IAddressesConfig): ModuleWithProviders {
		return {
			ngModule: AddressModule,
			providers: [
				{ provide: AddressesConfig, useValue: config }
			]
		};
	}
}
