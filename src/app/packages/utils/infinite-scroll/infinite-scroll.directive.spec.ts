import { InfiniteScrollDirective } from './infinite-scroll.directive';
import {ElementRef} from "../../../../../node_modules/@angular/core/src/linker/element_ref";

describe('InfiniteScrollDirective', () => {
  let directive: InfiniteScrollDirective;
  let element_fake: ElementRef;

  beforeEach(()=>{
    element_fake = <any> {nativeElement: {addEventListener: () => {}}};
    spyOn(element_fake.nativeElement, 'addEventListener');
    directive = new InfiniteScrollDirective(element_fake);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
    expect(element_fake.nativeElement.addEventListener).toHaveBeenCalled();
  });

  it('should check if scroll top on bottom', () => {
    let target = <any> {scrollTop: 0, clientHeight: 100, scrollHeight: 101};
    let $event: MouseEvent = <any> {target};
    spyOn(directive.ansynInfiniteScroll, 'emit');
    directive.onScroll($event);
    //not 0 + 100 >= 101
    expect(directive.ansynInfiniteScroll.emit).not.toHaveBeenCalled();
    target.scrollHeight = 101;
    directive.onScroll($event);
    //0 + 100 >= 99
    expect(directive.ansynInfiniteScroll.emit).toHaveBeenCalled();
  });

});
