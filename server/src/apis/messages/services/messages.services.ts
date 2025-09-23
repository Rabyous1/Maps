import { UserRepository } from '@/apis/user/UserRepository';
import { MessageRepository } from '@/apis/messages/messages.repository';
import { Message, SeenMessage } from '../messages.interfaces';
import HttpException from '@/utils/exceptions/http.exception';
import { GroupRepository } from '../groups/groups.repository';

export class MessageService {
    private messageRepository: MessageRepository;
    private userRepository: UserRepository;
    private groupRepository: GroupRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
        this.groupRepository = new GroupRepository();
    }
    public async sendMessage(
        senderId: string,
        messageData: {
            receiverId?: string;
            groupId?: string;
            content: string;
            attachments?: string[];
            isAnnouncement?: boolean;
        },
    ): Promise<Message> {
        const { receiverId, groupId, content, attachments, isAnnouncement } = messageData;

        if (!content || !!receiverId === !!groupId) {
            throw new HttpException(400, 'Must provide exactly one of receiverId (1:1) or groupId (group chat), and content.');
        }

        const sender = await this.userRepository.findOne({ id: senderId });
        if (!sender) throw new HttpException(404, 'Sender not found.');

        let message: Message;

        if (groupId) {
            const group = await this.groupRepository.findById(groupId);
            if (!group) throw new HttpException(404, 'Group not found.');

            message = this.messageRepository.create({
                sender,
                group,
                content,
                isAnnouncement: Boolean(isAnnouncement),
                attachments: attachments || [],
            });
        } else {
            const receiver = await this.userRepository.findOne({ id: receiverId! });
            if (!receiver) throw new HttpException(404, 'Receiver not found.');

            message = this.messageRepository.create({
                sender,
                receiver,
                content,
                isAnnouncement: Boolean(isAnnouncement),
                attachments: attachments || [],
            });
        }

        return await this.messageRepository.save(message);
    }

    public async sendGroupMessage(data: {
        senderId: string;
        groupId: string;
        content: string;
        isAnnouncement?: boolean;
        attachments?: string[];
    }): Promise<Message> {
        const { senderId, groupId, content, isAnnouncement, attachments } = data;

        if (!groupId || !content) {
            throw new HttpException(400, 'Group ID and content are required.');
        }

        const sender = await this.userRepository.findOne({ id: senderId });
        if (!sender) {
            throw new HttpException(404, 'Sender not found.');
        }

        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new HttpException(404, 'Group not found.');

        const messageData: Partial<Message> = {
            sender,
            group,
            content,
            isAnnouncement: Boolean(isAnnouncement),
            attachments: attachments || [],
        };

        const message = this.messageRepository.create(messageData);

        const saved = await this.messageRepository.save(message);

        const full = await this.messageRepository.repository.findOne({
            where: { id: saved.id },
            relations: ['sender', 'receiver', 'group'],
        });

        if (!full) {
            console.error('sendGroupMessage: failed to reload relations for', saved.id);
            throw new HttpException(500, 'Failed to load saved group message.');
        }

        return full;
    }

    public async getMessagesBetweenUsersPaginated(userAId: string, userBId: string, pageNumber: number = 1, pageSize: number = 20): Promise<any> {
        const where = [
            { sender: { id: userAId }, receiver: { id: userBId } },
            { sender: { id: userBId }, receiver: { id: userAId } },
        ];

        const [messages, totalMessages] = await this.messageRepository.repository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            relations: ['sender', 'receiver'],
        });

        return {
            pageNumber,
            pageSize,
            totalPages: Math.ceil(totalMessages / pageSize),
            totalMessages,
            messages,
        };
    }

    public async getMessagesForGroupPaginated(
        groupId: string,
        pageNumber = 1,
        pageSize = 20,
    ): Promise<{
        messages: Message[];
        totalMessages: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    }> {
        const [messages, totalMessages] = await this.messageRepository.repository.findAndCount({
            where: { group: { id: groupId } },
            order: { createdAt: 'DESC' },
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            relations: ['sender', 'receiver', 'group', 'seenBy', 'seenBy.user'],
        });

        return {
            messages,
            totalMessages,
            pageNumber,
            pageSize,
            totalPages: Math.ceil(totalMessages / pageSize),
        };
    }

    public async getUnreadCounts(userId: string): Promise<Record<string, number>> {
        return this.messageRepository.getUnreadCounts(userId);
    }

    public async getLastMessagesGroupedByUser(userId: string): Promise<Message[]> {
        const qb = this.messageRepository.repository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .leftJoinAndSelect('message.group', 'group')
            .where(
                'sender.id = :userId OR receiver.id = :userId OR group.id IN ' +
                    '(SELECT gm."groupId" FROM group_members gm WHERE gm."userId" = :userId)',
                { userId },
            )
            .orderBy('message.createdAt', 'DESC');

        const messages = await qb.getMany();

        const latestMessagesMap = new Map<string, Message>();

        for (const msg of messages) {
            let key: string;

            if (msg.group) {
                key = msg.group.id;
            } else if (msg.receiver) {
                const otherUserId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
                key = otherUserId;
            } else {
                continue;
            }

            if (!latestMessagesMap.has(key)) {
                latestMessagesMap.set(key, msg);
            }
        }

        return Array.from(latestMessagesMap.values());
    }

    public async markMessagesAsRead(userId: string, fromUserId: string): Promise<void> {
        await this.messageRepository.repository
            .createQueryBuilder()
            .update()
            .set({ isRead: true })
            .where('senderId = :fromUserId AND receiverId = :userId AND isRead = false', {
                fromUserId,
                userId,
            })
            .execute();
    }
    public async markGroupMessagesAsSeen(userId: string, groupId: string): Promise<void> {
        const msgs = await this.messageRepository.repository.find({
            where: { group: { id: groupId } },
            relations: ['seenBy', 'seenBy.user', 'sender'],
        });

        const toInsert: Partial<SeenMessage>[] = [];
        for (const msg of msgs) {
            if (msg.sender.id === userId) continue;

            const alreadySeen = msg.seenBy?.some(sm => sm.user.id === userId);
            if (!alreadySeen) {
                toInsert.push({
                    user: { id: userId } as any,
                    message: { id: msg.id } as any,
                });
            }
        }

        if (toInsert.length) {
            await this.messageRepository.repository.createQueryBuilder().insert().into('seen_message').values(toInsert).execute();
        }
    }

    public async loadConversation(
        userId: string,
        params: {
            withUserId?: string;
            groupId?: string;
            pageNumber?: number;
            pageSize?: number;
        },
    ) {
        const { withUserId, groupId, pageNumber = 1, pageSize = 20 } = params;

        if (!!groupId === !!withUserId) {
            throw new Error('Provide exactly one of groupId or withUserId');
        }

        if (groupId) {
            return this.getMessagesForGroupPaginated(groupId, pageNumber, pageSize);
        }

        const count = await this.groupRepository.getGroupCountById(withUserId!);
        if (count > 0) {
            return this.getMessagesForGroupPaginated(withUserId!, pageNumber, pageSize);
        }

        return this.getMessagesBetweenUsersPaginated(userId, withUserId!, pageNumber, pageSize);
    }
}     

       