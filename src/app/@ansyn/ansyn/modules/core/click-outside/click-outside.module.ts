import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './click-outside.directive';

@NgModule({
	declarations: [ClickOutsideDirective],
	exports: [ClickOutsideDirective],
	imports: [CommonModule]
})
export class ClickOutsideModule {
}
