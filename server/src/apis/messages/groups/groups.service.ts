import HttpException from '@/utils/exceptions/http.exception';
import { UserRepository } from '@/apis/user/UserRepository';
import { Group } from './groups.interfaces';
import { GroupRepository } from './groups.repository';
import { In } from 'typeorm';
import { MessageService } from '@/apis/messages/services/messages.services';

export class GroupService {
    private groupRepository = new GroupRepository();
    private userRepository = new UserRepository();
    private messageService = new MessageService();

    public async createGroup(name: string, memberIds: string[], creatorId: string): Promise<Group> {
        if (memberIds.length === 0) {
            throw new HttpException(400, 'Group members are required.');
        }

        const uniqueMemberIds = Array.from(new Set([...memberIds, creatorId]));

        const existingGroup = await this.groupRepository.findGroupByExactMembers(uniqueMemberIds);
        if (existingGroup) {
            throw new HttpException(409, 'A group with the same members already exists.');
        }

        const members = await this.userRepository.repository.find({
            where: { id: In(uniqueMemberIds) },
        });
        if (members.length !== uniqueMemberIds.length) {
            throw new HttpException(404, 'Some users not found.');
        }

        const group = this.groupRepository.create({ name, members });
        const savedGroup = await this.groupRepository.save(group);

        const creator = members.find(m => m.id === creatorId);
        const fullName = creator?.fullName || 'Someone';
        await this.messageService.sendGroupMessage({
            senderId: creatorId,
            groupId: savedGroup.id,
            content: `👋 ${fullName} created this group.`,
        });

        return savedGroup;
    }

    public async getGroupById(groupId: string): Promise<Group> {
        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new HttpException(404, 'Group not found.');
        return group;
    }
    public async getUserGroups(userId: string): Promise<Group[]> {
        return this.groupRepository.repository
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.members', 'm')
            .where('m.id = :userId', { userId })
            .getMany();
    }
    public async getGroupMembers(groupId: string) {
        const group = await this.groupRepository.repository.findOne({
            where: { id: groupId },
            relations: ['members'],
        });

        if (!group) {
            throw new HttpException(404, 'Group not found.');
        }

        return group.members;
    }
}
