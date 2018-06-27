import { NgModule } from '@angular/core';
import { HelpComponent } from './components/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@ansyn/core/core.module';
import { StoreModule } from '@ngrx/store';
import { helpFeatureKey, HelpReducer } from '@ansyn/menu-items/help/reducer/help.reducer';

@NgModule({
	imports: [CoreModule,
		CommonModule,
		CarouselModule.forRoot(),
		StoreModule.forFeature(helpFeatureKey, HelpReducer)
	],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {}
