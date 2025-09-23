import { EntitySchema } from 'typeorm';
import { Message, SeenMessage } from './messages.interfaces';

export const MessageEntitySchema = new EntitySchema<Message>({
    name: 'Message',
    tableName: 'message',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        content: {
            type: 'text',
            nullable: false,
        },
        isRead: {
            type: 'boolean',
            default: false,
        },
        attachments: {
            type: 'simple-array',
            nullable: true,
            default: '',
        },
        isAnnouncement: {
            type: 'boolean',
            default: false,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
    },
    relations: {
        sender: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'senderId' },
            nullable: false,
        },
        receiver: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'receiverId' },
            nullable: true,
        },
        group: {
            type: 'many-to-one',
            target: 'Group',
            joinColumn: { name: 'groupId' },
            nullable: true,
        },
        seenBy: {
            type: 'one-to-many',
            target: 'SeenMessage',
            inverseSide: 'message',
            cascade: ['insert'],
            eager: true,
        },
    },
});

export const SeenMessageEntitySchema = new EntitySchema<SeenMessage>({
    name: 'SeenMessage',
    tableName: 'seen_message',
    columns: {
        id: { type: 'uuid', primary: true, generated: 'uuid' },
        seenAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    },
    relations: {
        message: {
            type: 'many-to-one',
            target: 'Message',
            inverseSide: 'seenBy',
            joinColumn: { name: 'messageId', referencedColumnName: 'id' },
            nullable: false,
        },
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'userId', referencedColumnName: 'id' },
            nullable: false,
            eager: true, 
        },
    },
});