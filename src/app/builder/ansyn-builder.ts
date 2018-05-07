import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from './dynamic-ansyn.module';
import { Component, NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';
import { DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { ansynMenuItems } from '@ansyn/ansyn/ansyn.menu-items';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import { ansynAlerts } from '@ansyn/ansyn/ansyn-alerts';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { AppProvidersModule } from '@ansyn/ansyn/app-providers/app-providers.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppEffectsModule } from '@ansyn/ansyn/app-effects/app.effects.module';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { WindowLayout } from '@ansyn/core/reducers/core.reducer';
import { CoreModule } from '@ansyn/core/core.module';
import { CasesModule } from '@ansyn/menu-items/cases/cases.module';
import { FiltersModule } from '@ansyn/menu-items/filters/filters.module';
import { LayersManagerModule } from '@ansyn/menu-items/layers-manager/layers-manager.module';
import { ToolsModule } from '@ansyn/menu-items/tools/tools.module';
import { AlgorithmsModule } from '@ansyn/menu-items/algorithms/algorithms.module';
import { SettingsModule } from '@ansyn/menu-items/settings/settings.module';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox/imagery-sand-box.module';
import { MenuModule } from '@ansyn/menu/menu.module';
import { MapFacadeModule } from '@ansyn/map-facade/map-facade.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { AnsynRouterModule } from '@ansyn/router/router.module';
import { getProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { BrowserModule } from '@angular/platform-browser';
import { AnsynCustomComponent } from '@builder/ansynCustomComponent';
import { ansynComponentMeta } from '@ansyn/ansyn/ansyn/ansyn.component';


export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

export interface AnsynBuilderOptions {
	providers?: any[];
	windowLayout?: WindowLayout,
	importsToSet?: Map<AnsynModulesNames, any>
	sourceProviders?: Array<{ provide: any, useClass: any, multi: true }>
}

export enum AnsynModulesNames {
	BrowserModule = 'BrowserModule',
	CommonModule = 'CommonModule',
	AppProvidersModule = 'AppProvidersModule',
	OverlaysModule = 'OverlaysModule',
	FormsModule = 'FormsModule',
	HttpClientModule = 'HttpClientModule',
	BrowserAnimationsModule = 'BrowserAnimationsModule',
	AnsynPluginsModule = 'AnsynPluginsModule',
	CoreModule = 'CoreModule',
	CasesModule = 'CasesModule',
	FiltersModule = 'FiltersModule',
	LayersManagerModule = 'LayersManagerModule',
	ToolsModule = 'ToolsModule',
	AlgorithmsModule = 'AlgorithmsModule',
	SettingsModule = 'SettingsModule',
	ImagerySandBoxModule = 'ImagerySandBoxModule',
	MenuModule = 'MenuModule',
	AlertsModule = 'AlertsModule',
	AppEffectsModule = 'AppEffectsModule',
	MapFacadeModule = 'MapFacadeModule',
	ImageryModule = 'ImageryModule',
	StatusBarModule = 'StatusBarModule',
	AnsynRouterModule = 'AnsynRouterModule',
	RouterModule = 'RouterModule',
}

export class AnsynBuilder {
	static AnsynModulesNames = AnsynModulesNames;
	moduleRef: NgModuleRef<DynamicsAnsynModule>;
	appSelector = 'ansyn-app2';
	ansynModulesMap = new Map<AnsynModulesNames, any>([
		[AnsynModulesNames.CommonModule, CommonModule],
		[AnsynModulesNames.BrowserModule, BrowserModule],
		[AnsynModulesNames.AppProvidersModule, AppProvidersModule],
		[AnsynModulesNames.OverlaysModule, OverlaysModule],
		[AnsynModulesNames.FormsModule, FormsModule],
		[AnsynModulesNames.HttpClientModule, HttpClientModule],
		[AnsynModulesNames.BrowserAnimationsModule, BrowserAnimationsModule],
		[AnsynModulesNames.AnsynPluginsModule, AnsynPluginsModule],
		[AnsynModulesNames.CoreModule, CoreModule],
		[AnsynModulesNames.CasesModule, CasesModule],
		[AnsynModulesNames.FiltersModule, FiltersModule],
		[AnsynModulesNames.LayersManagerModule, LayersManagerModule],
		[AnsynModulesNames.ToolsModule, ToolsModule],
		[AnsynModulesNames.AlgorithmsModule, AlgorithmsModule],
		[AnsynModulesNames.SettingsModule, SettingsModule],
		[AnsynModulesNames.ImagerySandBoxModule, ImagerySandBoxModule],
		[AnsynModulesNames.MenuModule, MenuModule.provideMenuItems(ansynMenuItems)],
		[AnsynModulesNames.AlertsModule, AlertsModule.provideAlerts(ansynAlerts)],
		[AnsynModulesNames.AppEffectsModule, AppEffectsModule],
		[AnsynModulesNames.MapFacadeModule, MapFacadeModule],
		[AnsynModulesNames.ImageryModule, ImageryModule],
		[AnsynModulesNames.StatusBarModule, StatusBarModule],
		[AnsynModulesNames.AnsynRouterModule, AnsynRouterModule],
		[AnsynModulesNames.RouterModule, RouterModule.forRoot([], { useHash: true })]
	]);

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
		// elem.appendChild(document.createElement(this.appSelector));
	}

	setImports() {
		if (this.options && this.options.importsToSet && this.options.importsToSet.size) {
			Array.from(this.options.importsToSet.keys()).forEach(key => {
				const valueToSet = this.options.importsToSet.get(key);
				if (valueToSet === null) {
					this.ansynModulesMap.delete(key);
				} else {
					this.ansynModulesMap.set(key, this.options.importsToSet.get(key));
				}
			});
		}
	}

	setAppProviders() {
		if (this.options.sourceProviders && this.options.sourceProviders.length) {
			this.ansynModulesMap.set(AnsynModulesNames.AppProvidersModule, AppProvidersModule.forRoot(this.options.sourceProviders));
		}
	}


	buildModule(): any {
		const configProviders = getProviders(this.config);
		this.setImports();
		this.setAppProviders();
		const AnsynCustomComponenet = Component({ ...ansynComponentMeta, selector: this.id })(AnsynCustomComponent);
		const options: NgModule = {
			imports: [
				...Array.from(this.ansynModulesMap.values()),
				StoreModule.forRoot({}, { metaReducers }),
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
