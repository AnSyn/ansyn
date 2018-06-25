import { NgModule } from '@angular/core';
import { HelpComponent } from './help/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@ansyn/core/core.module';

@NgModule({
	imports: [CoreModule,
		CommonModule,
		CarouselModule.forRoot()],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {}
