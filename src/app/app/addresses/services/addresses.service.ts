import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AddressesConfigService } from "./addresses-config.service";
import { IAddressesConfig } from "../models/addresses.config";
import { AutoSubscriptions } from "auto-subscriptions";
import { catchError, map } from "rxjs/operators";
import { ErrorHandlerService } from "@ansyn/ansyn";
import { Observable } from "rxjs";

@Injectable()
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})

export class AddressesService implements OnInit, OnDestroy {

	get config(): IAddressesConfig {
		return this.addressesConfigService.config;
	}

	get url(): string {
		return this.config.url;
	}

	constructor(protected httpClient: HttpClient,
				protected addressesConfigService: AddressesConfigService) {
		this.loadAddresses('dev').subscribe(data => console.log(data));
		this.ngOnInit();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	public loadAddresses(environment: string): Observable<any> {
		const url = `${this.url}/address/${environment}`;

		return this.httpClient.get('http://localhost:8081/config').pipe(
			map(addresses => {
				console.log(addresses);
				return addresses;
			}),
			catchError((error: any) => {
				// return this.errorHandlerService.httpErrorHandle(error);
				console.log(error);
				return error;
			})
		);
	}
}
