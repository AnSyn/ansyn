import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { OverlayCustomProviderService } from './custom-providers/overlay-custom-provider.service';
import { CustomMapAppEffect } from './custom-effects/map.app.effects';
import { AppAnsynModule, BaseOverlaySourceProvider, MapAppEffects } from 'ansyn';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppAnsynModule,
  ],
  providers: [

    { provide: BaseOverlaySourceProvider, useClass: OverlayCustomProviderService },
    { provide: MapAppEffects, useClass: CustomMapAppEffect }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
