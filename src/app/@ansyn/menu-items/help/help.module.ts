import { NgModule } from '@angular/core';
import { HelpComponent } from './help/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CoreModule } from '@ansyn/core';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [CoreModule,
		CommonModule,
		CarouselModule.forRoot()],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {}
