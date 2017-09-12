/**
 * Created by AsafMas on 06/06/2017.
 */

import { CommunicatorEntity } from '../communicator-service/communicator.entity';

export interface IMapPlugin {
	pluginType: string;
	isEnabled: boolean;

	init(imageryCommunicator: CommunicatorEntity): void;

	dispose();
}
