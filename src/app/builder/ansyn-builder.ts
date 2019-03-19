import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi, AnsynModule, ContextAppEffects } from '@ansyn/ansyn';
import { of } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items';
import { getProviders } from '@ansyn/ansyn';
import { CommonModule } from '@angular/common';

export const buildAnsynCustomComponent = (selector) => (
	Component({
		selector,
		template: `<ansyn-app></ansyn-app>`,
		styleUrls: []
	})
	(class AnsynHost {
	})
);

export interface IAnsynBuilderConstructor {
	id: string;
	config: any;
	callback: any;
}

// @dynamic
export class AnsynBuilder {
	id: string;
	api: AnsynApi;
	config: any;
	callback: any;

	constructor({ id, config, callback }: IAnsynBuilderConstructor) {
		if (!id || !config) {
			throw new Error('Ansyn waiting for params');
		}
		this.id = id;
		this.config = config;
		this.callback = callback;
		this.bootStrapplatformWithAnsyn();
	}


	bootStrapplatformWithAnsyn() {
		this.createElement();
		this.bootstrapModule();
	}

	createElement(): void {
		let elem: HTMLElement = <any> document.getElementById(this.id);
		if (!elem) {
			throw new Error('Cant find element with id ' + this.id);
		}
		elem.appendChild(document.createElement(this.id));
	}

	buildModule(): any {
		const AnsynCustomComponent = buildAnsynCustomComponent(this.id);

		class BuilderDataLayersService extends DataLayersService {
			getAllLayersInATree() {
				return of([]);
			}
		}

		return NgModule({
			imports: [
				CommonModule,
				AnsynModule.component(this.id)
			],
			providers: [
				{ provide: DataLayersService, useClass: BuilderDataLayersService },
				{ provide: ContextAppEffects, useClass: class Empty {} }
			],
			declarations: [AnsynCustomComponent],
			bootstrap: [AnsynCustomComponent],
			exports: [AnsynCustomComponent]
		})
		(
			class AnsynCustom {
			}
		);
	}

	bootstrapModule(module = this.buildModule()) {
		platformBrowserDynamic(getProviders(this.config))
			.bootstrapModule(module)
			.then((moduleRef: NgModuleRef<any>) => {
				if (this.callback) {
					this.api = moduleRef.injector.get(AnsynApi);
					this.callback(this.api);
				}
			});
	}
}
