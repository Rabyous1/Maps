import { EntitySchema } from 'typeorm';
import { Group } from './groups.interfaces';

export const GroupEntitySchema = new EntitySchema<Group>({
    name: 'Group',
    tableName: 'group',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        name: {
            type: 'varchar',
            nullable: true,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        members: {
            type: 'many-to-many',
            target: 'User',
            joinTable: {
                name: 'group_members',
                joinColumn: { name: 'groupId', referencedColumnName: 'id' },
                inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
            },
            cascade: true,
        },
    },
});
