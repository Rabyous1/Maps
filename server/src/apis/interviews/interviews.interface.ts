import { Opportunity } from '../opportunity/opportunity.interfaces';
import { CandidateUser } from '../user/interfaces/candidate.interfaces';
import { RecruiterUser } from '../user/interfaces/recruiter.interfaces';
import { ApplicationI } from '../application/application.entity';

export interface Interview {
    id?: string;

    candidateId: string;
    applicationId: string;
    opportunityId: string;
    recruiterId?: string;

    date: string;
    durationMinutes: number;
    type: 'video' | 'in-person' | 'voice';
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    notes?: string;

    candidate?: CandidateUser;
    recruiter?: RecruiterUser;
    application?: ApplicationI;
    opportunity?: Opportunity;

    createdAt?: Date;
    updatedAt?: Date;
}
