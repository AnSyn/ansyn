import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ansyn-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.less']
})
export class CaseComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }

}
