import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent} from './menu/menu.component';
import { CoreModule } from '@ansyn/core';

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [MenuComponent],
  exports: [MenuComponent]
})
export class MenuModule { }
