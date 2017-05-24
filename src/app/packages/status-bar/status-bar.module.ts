import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [FormsModule, CommonModule],
	declarations: [StatusBarComponent],
	exports: [StatusBarComponent]
})
export class StatusBarModule { }
