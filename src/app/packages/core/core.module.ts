import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';

@NgModule({
	imports: [CommonModule, ToastModule],
	exports: [ToastModule]
})

export class CoreModule { }
