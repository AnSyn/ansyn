import { Component, OnInit } from '@angular/core';
import { CredentialsService } from "../../services/Credentials/credentials.service";
import { tap } from "rxjs/operators";

@Component({
	selector: 'ansyn-credentials',
	templateUrl: './credentials.component.html',
	styleUrls: ['./credentials.component.less']
})
export class CredentialsComponent implements OnInit {
	isOpen: boolean;
	credentialsMessage: any;

	constructor(protected credentialsService: CredentialsService) {
		this.isOpen = false;
	}

	ngOnInit() {
		this.credentialsService.getCredentials("hi").pipe(
			tap(() => {
				this.credentialsMessage = this.credentialsService.credentials;
			})
		).subscribe();
	}

	openCredentials() {
	}

	setIsOpenMode() {
		this.isOpen = !this.isOpen;
	}
}
