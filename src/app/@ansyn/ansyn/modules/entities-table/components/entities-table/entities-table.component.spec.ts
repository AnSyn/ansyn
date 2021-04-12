import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EntitiesTableComponent } from './entities-table.component';

describe('EntitiesTableComponent', () => {
	let component: EntitiesTableComponent<any>;
	let fixture: ComponentFixture<EntitiesTableComponent<any>>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [EntitiesTableComponent],
			imports: [
				TranslateModule.forRoot()
			],
			providers: []
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EntitiesTableComponent);
		component = fixture.componentInstance;
		component.entities = {
			entities: {},
			ids: []
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onCasesAdded should change tbodyElement scrollTop to 0( only if tbodyElement is not undefined )', () => {
		component.tbodyElement = <any>{
			nativeElement: { scrollTop: 100 }
		};
		component.onEntityAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('onMouseEnterCaseRow should calc the top of caseMenu and add "mouse-enter" class', () => {
		spyOn(component.onRowHover, 'emit');
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				add: () => null
			})};
		component.onMouseEnterRow(caseRow, 'id');
		expect(caseRow.classList.add).toHaveBeenCalledWith('mouse-enter');
		expect(component.onRowHover.emit).toHaveBeenCalledWith('id')
	});

	it('onMouseLeaveCaseRow should remove "mouse-enter" class', () => {
		spyOn(component.onRowHover, 'emit');
		const caseRow = <HTMLDivElement>{
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.onMouseLeaveRow(caseRow);
		expect(caseRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
		expect(component.onRowHover.emit).toHaveBeenCalledWith(undefined);
	});

	it('caseMenuClick should call stopPropagation() and remove mouse-enter class from caseRow', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		component.menuClick($event);
		expect($event.stopPropagation).toHaveBeenCalled();
	});

});
