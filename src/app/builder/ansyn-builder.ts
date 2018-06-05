import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from './customModule/dynamic-ansyn.module';
import { Component, NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';
import { DefaultUrlSerializer, UrlSerializer } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppProvidersModule } from '@ansyn/ansyn/app-providers/app-providers.module';
import { WindowLayout } from '@ansyn/core/reducers/core.reducer';
import { getProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { AnsynCustomComponent } from '@builder/customModule/ansynCustomComponent';
import { ansynComponentMeta } from '@ansyn/ansyn/ansyn/ansyn.component';
import { ansynImports } from '@ansyn/ansyn/ansyn.module';

export interface AnsynBuilderOptions {
	providers?: any[];
	windowLayout?: WindowLayout,
	importsToExclude?: string[],
	sourceProviders?: Array<{ provide: any, useClass: any, multi: true }>
}

const AnsynModulesNames = {};

Object.keys(ansynImports).forEach((key) => AnsynModulesNames[key] = key);

export class AnsynBuilder {
	static AnsynModulesNames = AnsynModulesNames;
	moduleRef: NgModuleRef<DynamicsAnsynModule>;
	appSelector = 'ansyn-app2';

	get api() {
		return this.moduleRef && this.moduleRef.instance.api;
	}

	constructor(public id: string, public config: any, public callback: any, public options?: AnsynBuilderOptions) {
		if (!id || !config) {
			throw new Error('Ansyn waiting for params');
		}
		this.bootStrapplatformWithAnsyn();
	}


	bootStrapplatformWithAnsyn() {
		this.createElement();
		this.bootsrapModule();
	}

	createElement(): void {
		let elem: HTMLElement = <any> document.getElementById(this.id);
		if (!elem) {
			throw new Error('Cant find element with id ' + this.id);
		}
		elem.appendChild(document.createElement(this.id));
	}

	getImports() {
		const importsToExclude = (this.options && this.options.importsToExclude) || [];
		return Object.entries(ansynImports)
			.filter(([name]) => !importsToExclude.includes(name))
			.map(([name, module]) => module);
	}

	getAppProviders() {
		const sourceProviders = (this.options && this.options.sourceProviders) || [];
		return AppProvidersModule.forRoot(sourceProviders);
	}


	buildModule(): any {
		const configProviders = getProviders(this.config);
		const imports = [...this.getImports(), this.getAppProviders()];
		const AnsynCustomComponenet = Component({
			...ansynComponentMeta,
			templateUrl: './customModule/ansyn.custom.component.html',
			selector: this.id
		})(AnsynCustomComponent);

		const options: NgModule = <any> {
			imports: [
				...imports,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([AnsynApi])
			],
			providers: [AnsynApi, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, ...configProviders],
			declarations: [AnsynCustomComponenet],
			bootstrap: [AnsynCustomComponenet],
			exports: [AnsynCustomComponenet]
		};

		return NgModule(options)(class AnsynCustom extends DynamicsAnsynModule {
		});
	}

	bootsrapModule(module = this.buildModule()) {
		platformBrowserDynamic()
			.bootstrapModule(module)
			.then((moduleRef: NgModuleRef<DynamicsAnsynModule>) => {
				this.moduleRef = moduleRef;
				this.api.loadDefaultCase();
				if (this.options && this.options.windowLayout) {
					this.api.changeWindowLayout(this.options.windowLayout);
				}
				this.callback(moduleRef.instance.api);
			});
	}

}
