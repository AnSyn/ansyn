import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCaseComponent } from './edit-case.component';
import { Input, Output, Component } from '@angular/core';

@Component({
  selector: 'ansyn-content',
  template: `<h1>ansyn-content</h1>`
})
class mockContentComponent {
  @Input() show;
  @Output() showChange;
  @Output() submitCase;
}

describe('EditCaseComponent', () => {
  let component: EditCaseComponent;
  let fixture: ComponentFixture<EditCaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCaseComponent, mockContentComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('show setter should call showChange.emit', () => {
    spyOn(component.showChange , 'emit');
    component.show = true;
    expect(component.showChange.emit).toHaveBeenCalledWith(true);
    expect(component.show).toBeTruthy();
  });

});
