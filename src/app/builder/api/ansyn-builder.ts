import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from '../dynamic-ansyn/dynamic-ansyn.module';
import { NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';
import { DefaultUrlSerializer, UrlSerializer } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { getProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { ansynImports } from '@ansyn/ansyn/ansyn.module';
import { ContextService } from '@ansyn/context/services/context.service';
import { Observable } from 'rxjs/Observable';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { AnsynBuilderModule } from '@builder/api/ansyn-builder.module';
import { WindowLayout } from '@builder/reducers/builder.reducer';
import { buildAnsynCustomComponent } from '@builder/dynamic-ansyn/bootstrap/ansyn.bootstrap.component';

export interface AnsynBuilderOptions {
	providers?: any[];
	windowLayout?: WindowLayout,
	importsToExclude?: string[],
	customModules?: any[],
	sourceProviders?: Array<{ provide: any, useClass: any, multi: true }>
}

export interface AnsynBuilderConstructor {
	id: string;
	config: any;
	options: AnsynBuilderOptions;
	callback: any;
}

export class AnsynBuilder {
	static CommonModule = ansynImports;
	static Providers = { ContextService };
	private builderExcludeModules = [ansynImports.AnsynRouterModule, ansynImports.MenuModule, ansynImports.CasesModule];


	id: string;
	config: any;
	options: AnsynBuilderOptions;
	callback: any;
	moduleRef: NgModuleRef<DynamicsAnsynModule>;

	get api() {
		return this.moduleRef && this.moduleRef.instance.api;
	}

	constructor({ id, config, options, callback }: AnsynBuilderConstructor) {
		if (!id || !config) {
			throw new Error('Ansyn waiting for params');
		}
		this.id = id;
		this.config = config;
		this.options = options || {};
		this.callback = callback;
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
		const importsToExclude = this.options.importsToExclude || [];
		return Object.values(ansynImports)
			.filter((module) => !this.builderExcludeModules.includes(module))
			.filter((module) => !importsToExclude.includes(module))
	}

	buildModule(): any {
		const AnsynCustomComponenet = buildAnsynCustomComponent(this.id);
		const configProviders = getProviders(this.config);
		const imports = [...this.getImports()];
		const customProviders = this.options.sourceProviders || [];
		const customModules = this.options.customModules || [];

		const options: NgModule = <any> {
			imports: [
				AnsynBuilderModule,
				...imports,
				...customModules,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([AnsynApi])
			],
			providers: [
				{ provide: UrlSerializer, useClass: DefaultUrlSerializer },
				...configProviders,
				customProviders,
				{ provide: ContextService, useValue: { loadContexts: () => Observable.of([]) } },
				{ provide: DataLayersService, useValue: { getAllLayersInATree: () => Observable.of([]) } },
			],
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

				if (this.callback) {
					this.callback(moduleRef.instance.api);
				}
			});
	}

}
