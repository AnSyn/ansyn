import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryStatusComponent } from './imagery-status.component';
import { Store, StoreModule } from '@ngrx/store';
import { CoreModule } from '@ansyn/core';
import { BackToWorldAction, SynchronizeMapsAction } from '@ansyn/map-facade/actions/map.actions';


describe('', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [CoreModule, StoreModule.provideStore({})],
			declarations: [ImageryStatusComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		component.map_id = 'test';
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('check click on backToWorldView', () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.back-to-world-view').click();
		expect(store.dispatch).toHaveBeenCalledWith(new BackToWorldAction({ mapId: 'test' }));
	});

	it('check click on toggleMapSynchronization', () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.status-bar-link-maps-icon img').click();
		expect(store.dispatch).toHaveBeenCalledWith(new SynchronizeMapsAction({ mapId: 'test' }));
	});

	it('expect backToWorldView get event, call stopPropagation and call dispatch with backToWorldViewAction', () => {
		spyOn(store, 'dispatch');
		component.backToWorldView();
		expect(store.dispatch).toHaveBeenCalledWith(new BackToWorldAction({ mapId: component.map_id }));
	});
});
