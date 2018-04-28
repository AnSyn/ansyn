import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagerySandBoxComponent } from './component/imagery-sand-box.component';
import { CoreModule } from '@ansyn/core/core.module';
import { FormsModule } from '@angular/forms';
import { ContextModule } from '@ansyn/context/context.module';

@NgModule({
	imports: [CommonModule, CoreModule, FormsModule, ContextModule],
	declarations: [ImagerySandBoxComponent],
	entryComponents: [ImagerySandBoxComponent]
})
export class ImagerySandBoxModule {
}
