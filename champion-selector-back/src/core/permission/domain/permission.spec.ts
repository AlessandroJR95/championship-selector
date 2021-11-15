import { PermissionRepository } from "src/core/permission/domain/permission.repository";
import { EventStore } from "src/modules/store/event.store";
import { EventStoreFactory } from "src/modules/store/event.store.factory";
import { MockClientFactory } from "src/modules/store/clients/mock/mock.factory";

describe("Championship tests", () => {
    let permissionRepository: PermissionRepository;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const eventStore = new EventStore(eventFactory);
        permissionRepository = new PermissionRepository(eventStore);
    });

    it('should add user token', async () => {
        const championshipID = 'Ale1'
        const token = 'tokenzão';

        await permissionRepository.createUserToken(championshipID, token);
        const permission = await permissionRepository.get(championshipID);

        expect(permission.hasOwnership()).toEqual(true);
        expect(permission.hasUserPermission(token)).toEqual(true);
        expect(permission.hasOwnerPermission(token)).toEqual(true);
    });

    it('should remove token', async () => {
        const championshipID = 'Ale1'
        const token = 'tokenzão';

        await permissionRepository.createOwnerToken(championshipID, token);
        let permission = await permissionRepository.get(championshipID);

        expect(permission.hasUserPermission(token)).toEqual(true);
        expect(permission.hasOwnerPermission(token)).toEqual(true);

        await permissionRepository.removeToken(championshipID, token);

        permission = await permissionRepository.get(championshipID);

        expect(permission.hasUserPermission(token)).toEqual(false);
        expect(permission.hasOwnerPermission(token)).toEqual(false);
    });

    it('should change ownership', async () => {
        const championshipID = 'Ale1'
        const token = 'tokenzão';
        const userToken = 'usertoken';

        await permissionRepository.createOwnerToken(championshipID, token);
        await permissionRepository.createUserToken(championshipID, userToken);

        let permission = await permissionRepository.get(championshipID);

        expect(permission.hasOwnership()).toEqual(true);
        expect(permission.hasUserPermission(token)).toEqual(true);
        expect(permission.hasOwnerPermission(token)).toEqual(true);
        expect(permission.hasOwnerPermission(userToken)).toEqual(false);

        await permissionRepository.removeToken(championshipID, token);

        permission = await permissionRepository.get(championshipID);

        expect(permission.hasOwnership()).toEqual(true);
        expect(permission.hasOwnerPermission(userToken)).toEqual(true);
    });

    it('should assign judgeID to token', async () => {
        const championshipID = 'Ale1'
        const judgeID = 'juizao'
        const token = 'tokenzão';
        await permissionRepository.createOwnerToken(championshipID, token);
    
        await permissionRepository.assignJudgeToAToken(championshipID, judgeID, token);

        let permission = await permissionRepository.get(championshipID);

        expect(permission.getJudgeToken(judgeID)).toEqual(token);
        expect(permission.getJudgeID(token)).toEqual(judgeID);

        await permissionRepository.removeToken(championshipID, token);

        permission = await permissionRepository.get(championshipID);

        expect(permission.getJudgeToken(judgeID)).toEqual(null);
        expect(permission.getJudgeID(token)).toEqual(null);
    });

});