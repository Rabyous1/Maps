import { CandidateUser } from '@/apis/user/interfaces/candidate.interfaces';


export function computeCandidateStats(data: Partial<CandidateUser>) {
    const profileCompleteness = calculateProfileCompleteness(data);
  return {
      numberOfSkills: data.skills?.length ?? 0,
      numberOfEducations: data.education?.length ?? 0,
      numberOfCertifications: data.certification?.length ?? 0,
      numberOfExperiences: data.professionalExperience?.length ?? 0,
      numberOfLanguages: data.languages?.length ?? 0,
      monthsOfExperiences: computeTotalMonths(data.professionalExperience ?? []),
      profileCompleteness,
  };
}
function computeTotalMonths(experiences: CandidateUser['professionalExperience'] = []) {
  let total = 0;
  for (const exp of experiences) {
    if (exp?.startDate) {
      const start = new Date(exp.startDate);
      const end = exp.toPresent ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      total += Math.max(0, months);
    }
  }
  return total;
}
function calculateProfileCompleteness(user: Partial<CandidateUser>): number {
    const keys = [
        'targetRole',
        'skills',
        'education',
        'professionalExperience',
        'certification',
        'languages',
        'summary',
        'dateOfBirth',
        'profilePicture',
        'country',
        'phone',
        'linkedinLink',
    ];

    let filledCount = 0;

    for (const key of keys) {
        const value = (user as any)[key];

        if (Array.isArray(value)) {
            if (value.length > 0) filledCount++;
        } else if (typeof value === 'string') {
            if (value.trim() !== '') filledCount++;
        } else if (typeof value === 'object' && value !== null) {
            if (Object.keys(value).length > 0) filledCount++;
        } else if (value !== null && value !== undefined) {
            filledCount++;
        }
    }

    return Math.round((filledCount / keys.length) * 100);
}
