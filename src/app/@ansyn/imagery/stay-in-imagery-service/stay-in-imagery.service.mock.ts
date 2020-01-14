import { StayInImageryService } from './stay-in-imagery.service';

export const mockStayInImageryService = 						{
	provide: StayInImageryService,
	useValue: {
		init: () => {}
	}
};
