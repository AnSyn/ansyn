import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { BackToBaseMapComponent } from './back-to-base-map.component';
import { Store, StoreModule } from '@ngrx/store';

describe('BackToBaseMapComponent', () => {
	let component: BackToBaseMapComponent;
	let fixture: ComponentFixture<BackToBaseMapComponent>;
	let store: Store<any>
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BackToBaseMapComponent],
			imports: [StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BackToBaseMapComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check click on backToWorldView', () => {
		spyOn(component, 'backToWorldView');
		fixture.nativeElement.querySelector('.back-to-world-view').click();
		expect(component.backToWorldView).toHaveBeenCalled();
	});
});
