import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'ansyn-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.less']
})
export class EmptyComponent implements OnInit {

  constructor() { }

  @HostBinding('style.display') dis = "'none'";

  ngOnInit() {
  }

}
