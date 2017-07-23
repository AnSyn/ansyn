import { AfterViewInit, Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import * as packageJson from '../../package.json';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent implements  AfterViewInit {
	constructor(public renderer: Renderer2, @Inject(DOCUMENT) private document: any ){
	}

	ngAfterViewInit(){
		const metaTag =  this.renderer.createElement('meta');
		metaTag.setAttribute('version',<any>packageJson['version']);
		this.renderer.appendChild(this.document.head,metaTag);


	}
}
