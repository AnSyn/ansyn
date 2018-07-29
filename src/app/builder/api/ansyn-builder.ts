import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from '../dynamic-ansyn/dynamic-ansyn.module';
import { NgModule, NgModuleRef, Provider } from '@angular/core';
import { DefaultUrlSerializer, UrlSerializer } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { getProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { ContextService } from '@ansyn/context/services/context.service';
import { Observable } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { AnsynBuilderModule } from '@builder/api/ansyn-builder.module';
import { IWindowLayout } from '@builder/reducers/builder.reducer';
import { buildAnsynCustomComponent } from '@builder/dynamic-ansyn/bootstrap/ansyn.bootstrap.component';
import { AppProvidersModule } from '@ansyn/ansyn/app-providers/app-providers.module';
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { CommonModule } from '@angular/common';
import { ToolsModule } from '@ansyn/menu-items/tools/tools.module';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapFacadeModule } from '@ansyn/map-facade/map-facade.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FiltersModule } from '@ansyn/menu-items/filters/filters.module';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { AppEffectsModule } from '@ansyn/ansyn/app-effects/app.effects.module';
import { CoreModule } from '@ansyn/core/core.module';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ansynAlerts } from '@ansyn/ansyn/ansyn-alerts';
import { AnsynApi } from '@builder/api/ansyn-api.service';

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

		const options: NgModule = <any> {
			imports: [
				AnsynBuilderModule,
				CommonModule,
				AppProvidersModule,
				FiltersModule,
				ToolsModule,
				OverlaysModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				AnsynPluginsModule,
				CoreModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				OverlaysModule,
				AnsynPluginsModule,
				CoreModule,
				AlertsModule.provideAlerts(ansynAlerts),
				AppEffectsModule,
				MapFacadeModule,
				ImageryModule,
				StatusBarModule,
				AlertsModule.provideAlerts(ansynAlerts),
				AppEffectsModule,
				MapFacadeModule,
				ImageryModule,
				StatusBarModule,
				...customModules,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [
				{ provide: UrlSerializer, useClass: DefaultUrlSerializer },
				...configProviders,
				customProviders,
				{ provide: ContextService, useValue: { loadContexts: () => of([]) } },
				{ provide: DataLayersService, useValue: { getAllLayersInATree: () => of([]) } },
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
