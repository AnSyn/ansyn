import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './click-outside.directive';
import { ClickOutsideService } from './click-outside.service';

@NgModule({
	declarations: [ClickOutsideDirective],
	exports: [ClickOutsideDirective],
	providers: [ClickOutsideService],
	imports: [CommonModule]
})
export class ClickOutsideModule {
}
