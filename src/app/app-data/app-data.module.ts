import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppDataService} from "./app-data.service";

@NgModule({
  imports: [CommonModule],
  providers: [AppDataService]
})
export class AppDataModule { }
