import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DynamicsAnsynModule } from './dynamic-ansyn.module';
import { EventEmitter, InjectionToken, NgModule, NgModuleRef } from '@angular/core';
import { AnsynApi } from './ansyn-api.service';
import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { getProviders } from '@ansyn/ansyn/app-providers';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

export class AnsynBuilder {
	api: AnsynApi;
	isReady$ = new EventEmitter<boolean>();
	id;
	configPath;

	constructor(id?: string, configPath?: string) {
		(id && configPath) ? this.bootStrapplatformWithAnsyn(id, configPath) : console.log('ansyn waiting for params');
	}

	bootStrapplatformWithAnsyn(id: string, configPath?: string, providers?) {
		this.id = id;
		this.configPath = configPath;
		this.createElement();
		if (configPath) {
			this.getProvidersFromJson(configPath).then(providers => {
				this.buildModule(providers, false);
				this.bootsrapModule();
			});
		}
		else if (providers) {
			this.buildModule(providers, false);
			this.bootsrapModule();
		}
		else {
			console.log('provide config json');
		}
	}

	createElement(id?: string): void {
		let div: HTMLDivElement = <any> document.getElementById(id || this.id);
		div.style.height = '100vh';
		div.style.width = '100vw';
		div.appendChild(document.createElement('ansyn-app'));
	}


	buildModule(providers, isNgModule, disAbleRouter?): any {
		return NgModule({
			imports: [
				AnsynModule,
				RouterModule.forRoot([], { useHash: true }),
				StoreModule.forRoot({}, { metaReducers }),
				EffectsModule.forRoot([AnsynApi]),
			],
			providers: [AnsynApi, ...providers],
			bootstrap: [AnsynComponent],
			exports: [AnsynComponent],


		})(isNgModule ? class AnsynCostum {
		} : DynamicsAnsynModule);
	}


	getProvidersFromJson(configPath): Promise<Array<{ provide: InjectionToken<Object>, useValue: Object }>> {
		return fetch(configPath || this.configPath || '/assets/config/app.config.json')
			.then(response => response.json())
			.then(getProviders);
	}

	getProvidersFromObject(appConfig): Array<{ provide: InjectionToken<Object>, useValue: Object }> {
		return getProviders(appConfig);
	}

	bootsrapModule(configPath?): void {
		this.getProvidersFromJson(configPath)
			.then(providers => platformBrowserDynamic(providers).bootstrapModule(DynamicsAnsynModule))
			.then((moduleRef: NgModuleRef<DynamicsAnsynModule>) => this.api = moduleRef.instance.api)
			.then(() => this.isReady$.emit(true));
	}
}
