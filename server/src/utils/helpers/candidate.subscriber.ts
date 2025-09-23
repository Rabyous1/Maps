import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { Role } from '@/utils/helpers/constants';
import { User } from '@/apis/user/interfaces/user.interfaces';
import { computeCandidateStats } from './candidate.helpers';


@EventSubscriber()
export class CandidateSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return 'User';
    }

    beforeInsert(event: InsertEvent<User>) {
        const u = event.entity as any;
        if (u.roles === Role.CANDIDAT) {
            Object.assign(u, computeCandidateStats(u));
        }
    }

    beforeUpdate(event: UpdateEvent<User>) {
        const u = event.entity as any;
        if (u && u.roles === Role.CANDIDAT) {
            Object.assign(u, computeCandidateStats(u));
        }
    }
}
