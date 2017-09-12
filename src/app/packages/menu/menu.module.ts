import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { CoreModule } from '@ansyn/core';
import { EffectsModule } from '@ngrx/effects';
import { MenuEffects } from './effects/menu.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
	imports: [CommonModule, CoreModule, EffectsModule.run(MenuEffects), BrowserAnimationsModule],
	declarations: [MenuComponent],
	exports: [MenuComponent]
})
export class MenuModule {
}
