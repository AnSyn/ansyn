import { Component, ElementRef, OnInit } from '@angular/core';
import { AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';

@Component({
  selector: 'ansyn-search-options',
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.less']
})
export class SearchOptinsComponent implements OnInit {

  isExpand: Boolean = false;

  constructor(protected clickOutside: ClickOutsideService,
              protected element: ElementRef) { }

  ngOnInit(): void {
  }

  toggleSearchPannel() {
    this.isExpand = !this.isExpand;
  }

  close() {
    this.isExpand = false;
  }

  

}
