import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';

@Component({
  selector: 'ansyn-search-options',
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.less']
})
@AutoSubscriptions()
export class SearchOptionsComponent implements OnInit, OnDestroy {

  isExpand: Boolean = false;

  @AutoSubscription
	isClickOutside$ = this.clickOutside.onClickOutside({monitor: this.element.nativeElement}).pipe(
		filter(clickOutside => clickOutside),
		tap(this.close.bind(this))
	);
  constructor(protected element: ElementRef,
              protected clickOutside: ClickOutsideService) { }
              
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }
  
  toggleSearchPannel() {
    this.isExpand = !this.isExpand;
  }

  close() {
    this.isExpand = false;
  }

}
