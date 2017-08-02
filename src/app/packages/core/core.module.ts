import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from './utils/toast/toast.module';
import { OverlayTextComponent } from './components/overlay-text/overlay-text.component';
import { GenericTypeResolverService } from './services/generic-type-resolver.service';



@NgModule({
	imports: [
		CommonModule,
		ToastModule,
	],
	providers: [GenericTypeResolverService],
	exports: [ToastModule, OverlayTextComponent],
	declarations: [OverlayTextComponent]
})

export class CoreModule { }
