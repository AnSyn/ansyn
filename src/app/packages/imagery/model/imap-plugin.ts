import { CommunicatorEntity } from '../communicator-service/communicator.entity';

export interface IMapPlugin {
	pluginType: string;
	isEnabled: boolean;

	init(imageryCommunicator: CommunicatorEntity): void;

	dispose();
}
