import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from '../dynamic-ansyn/dynamic-ansyn.module';
import { InjectionToken, NgModule, NgModuleRef, Provider } from '@angular/core';
import { DefaultUrlSerializer, UrlSerializer } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { getProviders } from '@ansyn/ansyn';
import { ContextService } from '@ansyn/context';
import { Observable } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items';
import { AppProvidersModule } from '@ansyn/ansyn';
import { AnsynPluginsModule } from '@ansyn/plugins';
import { CommonModule } from '@angular/common';
import { ToolsModule } from '@ansyn/menu-items';
import { AlertsModule } from '@ansyn/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapFacadeModule } from '@ansyn/map-facade';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FiltersModule } from '@ansyn/menu-items';
import { StatusBarModule } from '@ansyn/status-bar';
import { AppEffectsModule } from '@ansyn/ansyn';
import { CoreModule } from '@ansyn/core';
import { OverlaysModule } from '@ansyn/overlays';
import { ImageryModule } from '@ansyn/imagery';
import { LayersManagerModule } from '@ansyn/menu-items';
import { IWindowLayout } from '../reducers/builder.reducer';
import { AnsynApi } from './ansyn-api.service';
import { buildAnsynCustomComponent } from '../dynamic-ansyn/bootstrap/ansyn.bootstrap.component';
import { AnsynBuilderModule } from './ansyn-builder.module';
import { ansynConfig } from '@ansyn/ansyn';
import { ContextAppEffects } from '@ansyn/ansyn';

export interface IAnsynBuilderOptions {
	providers?: any[];
	windowLayout?: IWindowLayout,
	customModules?: any[],
	sourceProviders?: Array<Provider>,
	doInitialSearch?: boolean
}

export interface IAnsynBuilderConstructor {
	id: string;
	config: any;
	options: IAnsynBuilderOptions;
	callback: any;
}
// @dynamic
export class AnsynBuilder {
	static Providers = { ContextService };

	id: string;
	config: any;
	options: IAnsynBuilderOptions;
	callback: any;
	moduleRef: NgModuleRef<DynamicsAnsynModule>;

	get api(): AnsynApi {
		return this.moduleRef && this.moduleRef.instance.api;
	}

	constructor({ id, config, options, callback }: IAnsynBuilderConstructor) {
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

	buildModule(): any {
		const AnsynCustomComponenet = buildAnsynCustomComponent(this.id);
		const configProviders = getProviders(this.config);
		const customProviders = this.options.sourceProviders || [];
		const customModules = this.options.customModules || [];

		class BuilderDataLayersService extends DataLayersService {
			getAllLayersInATree() {
				return Observable.of([]);
			}
		}

		const options: NgModule = <any> {
			imports: [
				AnsynBuilderModule.provideId(this.id),
				CommonModule,
				AppProvidersModule,
				FiltersModule,
				ToolsModule,
				LayersManagerModule,
				OverlaysModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				AnsynPluginsModule,
				CoreModule,
				AlertsModule.provideAlerts(ansynConfig.ansynAlerts),
				AppEffectsModule,
				MapFacadeModule,
				ImageryModule,
				StatusBarModule,
				...customModules,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [
				AnsynApi,
				{ provide: UrlSerializer, useClass: DefaultUrlSerializer },
				...configProviders,
				customProviders,
				{ provide: ContextService, useValue: { loadContexts: () => Observable.of([]) } },
				{ provide: DataLayersService, useClass: BuilderDataLayersService },
				{ provide: ContextAppEffects, useClass: class Empty {} }
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
