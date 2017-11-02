## ExampleAnsyn

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.0-rc.6.

## Installation:

 - Initizlize app: `ng new my-app` 
 - Run `npm install ansyn`
 - Add assets and styles on `angular-cli.json`:
 ```json
 "assets": [
    { "glob": "**/*", "input": "../node_modules/ansyn/src/assets/", "output": "./assets/" }
  ],
  "styles": [
    "../node_modules/ansyn/src/styles/styles.less"
  ],
  ...
  "defaults": {
    "styleExt": "less"
  }
 ```
 - Fetch ansyn config on `main.ts`:
 ```typescript
import { fetchConfigProviders } from 'ansyn/src/app/app-providers';

fetchConfigProviders.then(providers => platformBrowserDynamic(providers).bootstrapModule(AppModule));
```
 - Add `AppAnsynModule` to your list of module imports:

```typescript
import { AppAnsynModule } from 'ansyn';

@NgModule({
  imports: [
    AppAnsynModule
  ],
})
export class AppModule { 

}
``` 
- finaly add ansyn component tag on `AppComponent`:

```html
<ansyn-root></ansyn-root>
```

## Usage
- provide `BaseOverlaySourceProvider` with your custom provider for example:
```typescript
providers: [
  { provide: BaseOverlaySourceProvider, useClass: OverlayCustomProviderService }
]

@Injectable()
export class OverlayCustomProviderService extends IdahoSourceProvider {
  fetch(fetchParams: IFetchParams) {
    // ...code
    return super.fetch(fetchParams);
  }
}
```

- provide `MapAppEffects` with your custom effects provider for example:

  * make sure your `actions$` is protected or public (**not** private) 

```typescript
providers: [
  { provide: MapAppEffects, useClass: CustomMapAppEffect }
]

@Injectable()
export class CustomMapAppEffect extends MapAppEffects {
  // Use super(this) for onDisplayOverlay$ add filter, map, do etc.
  onDisplayOverlay$: Observable<any> = this.onDisplayOverlay$
    .filter(() => true)
    .map(data => data)
    .do(() => {
      // ...code
    });

  // Override (=) onStartMapShadow$
  onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
    .ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
    .map(() => new StartMapShadowAction())
    .do(() => {
      // ...code
    });
}
```

# Good luck! 🙂
