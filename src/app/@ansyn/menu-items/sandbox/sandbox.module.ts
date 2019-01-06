import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SandboxComponent } from './components/sandbox.component';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [SandboxComponent],
	entryComponents: [SandboxComponent]
})
export class SandboxModule {
}
