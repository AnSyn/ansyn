import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import * as packageJson from '../../../package.json';
import { DOCUMENT } from '@angular/common';
import '@ansyn/core/utils/clone-deep';

@Component({
	selector: 'ansyn-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppAnsynComponent implements AfterViewInit {

	constructor(public renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {
	}

	ngAfterViewInit() {
		const metaTag = this.renderer.createElement('meta');
		metaTag.setAttribute('version', (<any>packageJson).version);
		this.renderer.appendChild(this.document.head, metaTag);
	}

}
