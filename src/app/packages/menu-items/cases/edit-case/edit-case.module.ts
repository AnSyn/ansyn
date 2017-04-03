import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from "./content/content.component";
import { EditCaseComponent } from './edit-case/edit-case.component';
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations:[ContentComponent, EditCaseComponent],
  exports:[EditCaseComponent]
})

export class EditCaseModule { }
