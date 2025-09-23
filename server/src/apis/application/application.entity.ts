
import { ApplicationStatus, InterestStatus} from '@/utils/helpers/constants';
import { User } from '../user/interfaces/user.interfaces';
import { Opportunity } from '../opportunity/opportunity.interfaces';

export interface ApplicationI {
    id: string;
    status: ApplicationStatus;
    interest: InterestStatus;
    applicationDate: Date;
    note: string;
    resume: string;
    cvvideo: string;
    candidate: User;
    opportunity: Opportunity;
    createdAt: Date;
    updatedAt: Date;
}
