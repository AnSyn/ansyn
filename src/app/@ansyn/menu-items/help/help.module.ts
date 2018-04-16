import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help/help.component';
import { CoreModule } from '@ansyn/core';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations: [HelpComponent],
	entryComponents: [HelpComponent]
})
export class HelpModule {

}
