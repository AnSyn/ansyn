import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from './dynamic-ansyn.module';
import { NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';
import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { getProviders } from '@ansyn/ansyn/app-providers/index';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LoadDefaultCaseAction } from '@ansyn/menu-items/index';
import { coreInitialState, WindowLayout } from '@ansyn/core';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

export interface AnsynBuilderOptions {
	providers: any[];
	windowLayout: WindowLayout
}

export class AnsynBuilder {
	moduleRef: NgModuleRef<DynamicsAnsynModule>;
	appSelector = 'ansyn-app';

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
		elem.appendChild(document.createElement(this.appSelector));
	}


	buildModule(): any {
		const providers = getProviders(this.config);
		const options: NgModule = {
			imports: [
				AnsynModule,
				RouterModule.forRoot([], { useHash: true }),
				StoreModule.forRoot({}, { metaReducers }),
				EffectsModule.forRoot([AnsynApi])
			],
			providers: [AnsynApi, ...providers],
			bootstrap: [AnsynComponent],
			exports: [AnsynComponent]
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
