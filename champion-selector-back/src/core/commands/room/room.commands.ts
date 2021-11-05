import { Command } from '../../modules/command/command';

export class KickClientCommand extends Command {
    constructor(entityID: string, clientID: string) {
        super(entityID, 'KICK_CLIENT_COMMAND', { clientID });
    }
}