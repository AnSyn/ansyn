import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import * as packageJson from '../../../package.json';
import { DOCUMENT } from '@angular/common';
import { Auth0Service } from '@ansyn/login/services/auth0.service';

@Component({
	selector: 'ansyn-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppAnsynComponent implements AfterViewInit {

	constructor(public renderer: Renderer2, @Inject(DOCUMENT) protected document: Document, public auth0: Auth0Service) {
		this.auth0.handleAuthentication();
	}

	ngAfterViewInit() {
		const metaTag = this.renderer.createElement('meta');
		metaTag.setAttribute('version', (<any>packageJson).version);
		this.renderer.appendChild(this.document.head, metaTag);
	}

}
