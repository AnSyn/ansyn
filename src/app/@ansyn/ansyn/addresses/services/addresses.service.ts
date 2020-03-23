import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AddressesConfigService } from "./addresses-config.service";
import { IAddressesConfig } from "../models/addresses.config";
import { AutoSubscriptions } from "auto-subscriptions";
import { catchError, map } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import { fetchConfigProviders } from "../../fetch-config-providers";

@Injectable()
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})

export class AddressesService implements OnInit, OnDestroy {
	addresses;

	get config(): IAddressesConfig {
		return this.addressesConfigService.config;
	}

	get url(): string {
		return this.config.url;
	}

	constructor(protected httpClient: HttpClient,
				protected addressesConfigService: AddressesConfigService) {
		this.loadAddresses$('prod');
		this.ngOnInit();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	public loadAddresses$(environment: string): Observable<any> {
		// const url = `${this.url}/address/${environment}`;
		const url = `http://localhost:8080/address/${environment}`;

		const addressesObservable = this.httpClient.get<any>(url).pipe(
			map(addresses =>  addresses),
			catchError((error: any) => throwError(error))
		);

		return addressesObservable;
	}
}
