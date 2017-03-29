import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '../../../helpers/mock-component';
import { ContainerComponent } from './container.component';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Subscription,Observable,Observer } from 'rxjs/Rx';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import * as d3 from 'd3';



describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
  let timeLineService: TimelineService;
  let de: DebugElement;
  


  beforeEach(async(() => {
    TestBed.configureTestingModule({
  		providers:[
  			TimelineService,
  			TimelineEmitterService
  		],
  		declarations: [
      		ContainerComponent,
      		MockComponent({selector: 'timeline',inputs: ['drops','configuration']}) 
  		],
  		imports:[HttpModule]
    })
    .compileComponents();
  }));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		timeLineService = fixture.debugElement.injector.get(TimelineService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check that fetchData has been called', () => {     
		spyOn(timeLineService,'fetchData').and.callFake(()=>{
				return Observable.create( (observer: Observer<any>) =>{
					observer.next({key: 'value'});	
				});
			});
		component.ngOnInit();
		expect(timeLineService.fetchData).toHaveBeenCalled();
	})

	it('check that the container div is in he\'s place',()=> {
		de = fixture.debugElement.query(By.css('.timeline-container'));	
		expect(de.nativeElement.childElementCount).toBe(1);

	});
});
