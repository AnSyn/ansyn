/**
 * Created by AsafMasa on 26/04/2017.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';

describe('ImageryComponent', () => {
	let component: ImageryComponent;
	let fixture: ComponentFixture<ImageryComponent>;

	const imageryData = {id: 'imagery1', mapTypes: ['openLayers']};

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [ ImageryComponent ]}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {expect(component).toBeTruthy(); });

	it('Create OPenLayersMap', () => {
		component.mapComponentSettings = imageryData;
		component.ngOnInit();
		const div = fixture.nativeElement.querySelector('#openLayersMap');
		expect(div).toBeDefined();
		const olOverlaycontainer = div.querySelector('.ol-overlaycontainer');
		expect(olOverlaycontainer).toBeDefined();
	});
});
