import { MockComponent } from '../../../../../../ansyn/modules/core/test/mock-component';

export const mockAnnotationsColorComponent = MockComponent({
	selector: 'ansyn-annotations-color',
	inputs: ['show', 'properties', 'fillModeActive', 'strokeModeActive'],
	outputs: ['colorChange', 'activeChange']
});
