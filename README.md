## AnSyn

AnSyn is an end-to-end solution for overhead image analysis.
Simple, intuitive and easy to use – you don’t have to be an expert anymore to
leverage the power of drones and satellites data for your needs!

**[AnSyn Platform](http://platform.ansyn.io)**

### Installation

##### Install with `npm`
```shell
npm install @ansyn/ansyn @ansyn/assets @ansyn/core @ngrx/core @ngrx/store @ngrx/effects @ngrx/entity ngx-treeview ol cesium d3 @angular/cdk @angular/material
```

##### Install with `yarn`
```shell
yarn add @ansyn/ansyn @ansyn/assets @ansyn/core @ngrx/core @ngrx/store @ngrx/effects @ngrx/entity ngx-treeview ol cesium d3 @angular/cdk @angular/material
```

### Usage
Add ansyn to your assets / styles on `angular.json` file,  under yourProject/architect/build/options:

```json
 "assets": [
	{
	  "glob": "**/*",
	  "input": "./node_modules/@ansyn/assets",
	  "output": "/assets"
	},
	{
	  "glob": "**/*",
	  "input": "node_modules/cesium/Build/Cesium",
	  "output": "/assets/Cesium"
	}
 ],
 "styles": [
   "node_modules/@ansyn/assets/styles/styles.css"
 ],
 "scripts": [
   "node_modules/cesium/Build/Cesium/Cesium.js"
 ]
```

on `main.ts` file:

```typescript
import { fetchConfigProviders } from '@ansyn/ansyn';

fetchConfigProviders('assets/config/app.config.json').then(providers =>  platformBrowserDynamic(providers).bootstrapModule(AppModule).catch(err => console.log(err)));
```

on `app.module.ts`:
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AnsynModule } from '@ansyn/ansyn';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AnsynModule.component()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

on `app.component.html`:

```html
  ...
  <ansyn-app></ansyn-app>
  ...
```
`AnsynApi` service on `ansyn.component.ts`:
```typescript
import { AnsynApi } from '@ansyn/ansyn';

@Component({
...
})
export class AppComponent {
  constructor(protected ansynApi: AnsynApi) {
  }
}
```

on `app.component.css`:

The element `ansyn-app` has to receive height. It can be explicit height, or implicit like "display:flex" + "flex:1"
For example:

```
ansyn-app {
  display: block;
  height: 500px;
  border: 1px solid darkgreen;
}
```

