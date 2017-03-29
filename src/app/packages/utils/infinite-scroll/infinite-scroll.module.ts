import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollDirective } from "./infinite-scroll.directive";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [InfiniteScrollDirective],
  exports: [InfiniteScrollDirective]
})
export class InfiniteScrollModule { }
