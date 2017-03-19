import {Directive, ElementRef, EventEmitter, HostListener, Output, Input} from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]'

})
export class InfiniteScrollDirective {
  @Output("appInfiniteScroll") private appInfiniteScroll = new EventEmitter();

  @HostListener("scroll", ["$event"]) scroll($event) {

    if(Math.round($event.target.scrollTop + $event.target.clientHeight) >= $event.target.scrollHeight){
      this.appInfiniteScroll.emit()
    }
  }

  constructor() {}

}
