import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { geometry } from '@turf/turf';
import { extentFromGeojson } from '../../modules/core/public_api';

describe('OverlayOutOfBoundsComponent', () => {
	let component: OverlayOutOfBoundsComponent;
	let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ImageryCommunicatorService],
			declarations: [OverlayOutOfBoundsComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService: ImageryCommunicatorService) => {
		fixture = TestBed.createComponent(OverlayOutOfBoundsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on button should call "backToExtent"', () => {
		spyOn(component, 'backToExtent');
		const button = fixture.debugElement.query(By.css('button'));
		button.triggerEventHandler('click', {});
		expect(component.backToExtent).toHaveBeenCalled();
	});

	it('backToExtent should calc extent and call fitToExtent', () => {
		component.overlay = <any> { footprint: geometry('Polygon', [[[0, 0], [1, 1], [2, 2], [0, 0]]]) };
		const ActiveMap = jasmine.createSpyObj({ fitToExtent: of(true) });
		spyOn(imageryCommunicatorService, 'provide').and.returnValue({ ActiveMap });
		component.backToExtent();
		const extent = extentFromGeojson(component.overlay.footprint)
		expect(ActiveMap.fitToExtent).toHaveBeenCalledWith(extent);
	});

});
