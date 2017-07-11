import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { OverlayTextComponent } from './components/overlay-text/overlay-text.component';

@NgModule({
	imports: [CommonModule, ToastModule],
	exports: [ToastModule, OverlayTextComponent],
	declarations: [OverlayTextComponent]
})

export class CoreModule { }
