import { NgModule } from '@angular/core';
import { HelpComponent } from './components/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { HelpEffects } from '@ansyn/menu-items/help/effects/help.effects';
import { HelpLocalStorageService } from '@ansyn/menu-items/help/services/help.local-storage.service';

@NgModule({
	imports: [CoreModule,
		CommonModule,
		CarouselModule.forRoot(),
		EffectsModule.forFeature([HelpEffects])
	],
	providers: [HelpLocalStorageService],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {
}
