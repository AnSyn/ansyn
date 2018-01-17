import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanFilterContainerComponent } from './boolean-filter-container.component';
import { BooleanFilterMetadata } from '../../models/metadata/boolean-filter-metadata';

describe('BooleanFilterContainerComponent', () => {
	let component: BooleanFilterContainerComponent;
	let fixture: ComponentFixture<BooleanFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BooleanFilterContainerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BooleanFilterContainerComponent);
		component = fixture.componentInstance;
		component.metadata = new BooleanFilterMetadata();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onInputClicked should send key value to metadata service, and dispatch changes event', () => {
		spyOn(component.onMetadataChange, 'emit');
		spyOn(component.metadata, 'updateMetadata');
		component.onInputClicked('key', true);
		expect(component.metadata.updateMetadata).toHaveBeenCalledWith({ key: 'key', value: true });
		expect(component.onMetadataChange.emit).toHaveBeenCalledWith(component.metadata);
	});

	it('selectOnly should call selectOnly on metadata, and dispatch changes event', () => {
		spyOn(component.onMetadataChange, 'emit');
		spyOn(component.metadata, 'selectOnly');
		component.selectOnly('key');
		expect(component.metadata.selectOnly).toHaveBeenCalledWith('key');
		expect(component.onMetadataChange.emit).toHaveBeenCalledWith(component.metadata);
	});

});
