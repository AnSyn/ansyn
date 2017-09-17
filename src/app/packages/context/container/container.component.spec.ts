import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ContainerComponent } from './container.component';
import { ContextConfig } from '../context.module';
import { MOCK_TEST_CONFIG } from '../providers/context-test-source.service.spec';
import { BaseContextSourceProvider } from '../context.interface';
import { ContextTestSourceService } from '../providers/context-test-source.service';

describe('ContainerComponent', () => {
	let component: ContainerComponent;
	let fixture: ComponentFixture<ContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ContainerComponent],
			imports: [FormsModule],
			providers: [
				{ provide: ContextConfig, useValue: MOCK_TEST_CONFIG },
				{ provide: BaseContextSourceProvider, useClass: ContextTestSourceService }
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
