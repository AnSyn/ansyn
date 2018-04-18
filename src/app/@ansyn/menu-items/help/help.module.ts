import { NgModule } from '@angular/core';
import { HelpComponent } from './help/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';

@NgModule({
	imports: [CarouselModule.forRoot()],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {

}
