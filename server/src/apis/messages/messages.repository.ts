import { Repository } from 'typeorm';
import { Message } from './messages.interfaces';
import { MessageEntitySchema } from './messages.model';
import { AppDataSource } from '@/utils/databases';

export class MessageRepository {
    public repository: Repository<Message>;

    constructor() {
        this.repository = AppDataSource.getRepository(MessageEntitySchema);
    }

    public create(messageData: Partial<Message>): Message {
        return this.repository.create(messageData);
    }

    public async save(message: Message): Promise<Message> {
        return this.repository.save(message);
    }
    async markAsRead(messageId: string): Promise<void> {
        await this.repository.update(messageId, { isRead: true });
    }

    async deleteMessage(messageId: string): Promise<void> {
        await this.repository.delete(messageId);
    }
    async findBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
        return this.repository.find({
            where: [
                { sender: { id: user1Id }, receiver: { id: user2Id } },
                { sender: { id: user2Id }, receiver: { id: user1Id } },
            ],
            relations: ['sender', 'receiver'],
            order: { createdAt: 'ASC' },
        });
    }
    async getUnreadCounts(userId: string): Promise<Record<string, number>> {
        const result: Record<string, number> = {};

        // PRIVATE CHAT MESSAGES
        const privateRows = await this.repository
            .createQueryBuilder('message')
            .select('message.senderId', 'id')
            .addSelect('COUNT(*)', 'count')
            .where('message.receiverId = :userId', { userId })
            .andWhere('message.isRead = false')
            .groupBy('message.senderId')
            .getRawMany<{ id: string; count: string }>();

        for (const { id, count } of privateRows) {
            result[id] = Number(count);
        }

        // GROUP CHAT MESSAGES
        const groupRows = await this.repository
            .createQueryBuilder('message')
            .leftJoin('message.seenBy', 'seen', 'seen.userId = :userId', { userId })
            .select('message.groupId', 'id')
            .addSelect('COUNT(*)', 'count')
            .where(qb => {
                const sub = qb.subQuery().select('gm.groupId').from('group_members', 'gm').where('gm.userId = :userId').getQuery();
                return `message.groupId IN ${sub}`;
            })
            .andWhere('message.senderId != :userId', { userId }) 
            .andWhere('seen.id IS NULL')
            .groupBy('message.groupId')
            .getRawMany<{ id: string; count: string }>();

        for (const { id, count } of groupRows) {
            result[id] = (result[id] || 0) + Number(count);
        }

        return result;
    }
}

