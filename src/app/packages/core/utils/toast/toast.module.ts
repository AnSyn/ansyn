import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';

@NgModule({
	imports: [CommonModule],
	declarations: [ToastComponent],
	exports: [ToastComponent]

})
export class ToastModule { }
