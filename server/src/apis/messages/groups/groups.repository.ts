import { AppDataSource } from '@/utils/databases';
import { Repository } from 'typeorm';
import { Group } from './groups.interfaces';
import { GroupEntitySchema } from './groups.model';

export class GroupRepository {
    public repository: Repository<Group>;

    constructor() {
        this.repository = AppDataSource.getRepository(GroupEntitySchema);
    }

    public create(groupData: Partial<Group>): Group {
        return this.repository.create(groupData);
    }

    public async save(group: Group): Promise<Group> {
        return await this.repository.save(group);
    }

    public async findById(id: string): Promise<Group | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['members'],
        });
    }
    public async findGroupByExactMembers(userIds: string[]): Promise<Group | null> {
        const candidateGroups = await this.repository.createQueryBuilder('group').leftJoinAndSelect('group.members', 'member').getMany(); // ❌ no WHERE or GROUP BY

        return (
            candidateGroups.find(group => {
                const groupMemberIds = group.members.map(m => m.id).sort();
                const sortedInput = [...userIds].sort();
                return groupMemberIds.length === sortedInput.length && groupMemberIds.every((id, index) => id === sortedInput[index]);
            }) ?? null
        );
    }
    public async getGroupCountById(groupId: string): Promise<number> {
        return this.repository.count({
            where: { id: groupId },
        });
    }
}
