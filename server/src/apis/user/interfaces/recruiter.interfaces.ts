import { User } from './user.interfaces';

export interface RecruiterUser extends User {
    position?: string;
    department?: string;
    companyName?: string;
    companyWebsite?: string;
    companySize?: string;
    recruiterSummary?: string;
    legalStatus?: string;
    fiscalNumber?: string;
    currentCompany?: string;
}
