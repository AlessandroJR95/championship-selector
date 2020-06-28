import * as crypto from 'crypto';

export const generateIDForMap = (mapStructure) => {
    let unique = crypto.randomBytes(20).toString('hex');

    while (mapStructure.has(unique)) {
        unique = crypto.randomBytes(20).toString('hex');
    }

    return unique;
}