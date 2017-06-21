import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';

@NgModule({
	imports: [FormsModule, CommonModule, CoreModule],
	declarations: [StatusBarComponent],
	exports: [StatusBarComponent]
})
export class StatusBarModule { }
