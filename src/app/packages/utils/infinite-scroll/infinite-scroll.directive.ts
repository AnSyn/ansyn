import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';
import { debounce } from 'lodash';

@Directive({
  selector: '[ansynInfiniteScroll]'

})
export class InfiniteScrollDirective {
  @Output("ansynInfiniteScroll") ansynInfiniteScroll = new EventEmitter();

  constructor(private elementRef:ElementRef) {
    elementRef.nativeElement.addEventListener("scroll", debounce(this.onScroll.bind(this), 300));
  }

  onScroll($event) {
    if(Math.round($event.target.scrollTop + $event.target.clientHeight) >= $event.target.scrollHeight){
      this.ansynInfiniteScroll.emit();
    }
  }

}
