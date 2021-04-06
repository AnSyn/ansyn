import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import * as packageJson from 'root/package.json';
import { DOCUMENT } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LoggerService } from '@ansyn/ansyn';
import { Store } from "@ngrx/store";
import { SelectMenuItemAction, ToggleMenuCollapse } from "@ansyn/menu";

@Component({
	selector: 'ansyn-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppAnsynComponent implements AfterViewInit {
	mobileOrTable: boolean = this.deviceService.isMobile() || this.deviceService.isTablet();
	validBrowser: boolean = ['chrome', 'safari'].includes(this.deviceService.browser.toLowerCase()) && !this.mobileOrTable;
	keysPressed: any = {};

	constructor(store: Store, public renderer: Renderer2, @Inject(DOCUMENT) protected document: Document, private deviceService: DeviceDetectorService, private loggerService: LoggerService) {
		document.addEventListener('keydown', (event) => {
			this.keysPressed[event.key] = true;

			if (this.keysPressed['Control'] && event.key === 'q') {
				store.dispatch(new ToggleMenuCollapse(false));
				store.dispatch(new SelectMenuItemAction({ menuKey: "Sandbox" }));
				this.keysPressed = {};
			}
		});

		document.addEventListener('keyup', (event) => {
			delete this.keysPressed[event.key];
		});
	}

	browserLogs(): void {
		const { browser, browser_version } = this.deviceService;
		this.loggerService.info(`Browser: ${ browser } ${ browser_version }`);
	}

	ngAfterViewInit() {
		const metaTag = this.renderer.createElement('meta');
		metaTag.setAttribute('version', (<any>packageJson).version);
		this.renderer.appendChild(this.document.head, metaTag);
		this.browserLogs();
	}

}
