import { Router, Request, Response, NextFunction } from 'express';
import isAuthenticated from '@/middlewares/authentication.middleware';
import { InterviewService } from './interviews.service';
import { restrictTo } from '@/middlewares/role.middleware';
import { NotificationTypes, Role } from '@/utils/helpers/constants';
import { emitNotification } from '@/utils/config/socket/events/emitNotification';

class InterviewController {
    public path = '/interviews';
    public router = Router();
    private interviewService = new InterviewService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.addInterview);
        this.router.get(`${this.path}`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.getRecruiterInterviews);
        this.router.delete(`${this.path}/:id`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.deleteInterview);
        this.router.patch(`${this.path}/:id`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.updateInterview);
        this.router.get(`${this.path}/:id`, isAuthenticated, restrictTo(Role.RECRUTEUR), this.getInterviewById);
        this.router.get(`${this.path}/candidate/list`, isAuthenticated, restrictTo(Role.CANDIDAT), this.getCandidateInterviews);
    }

    private addInterview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const recruiterId = (req as any).user?._id;
            console.log('Recruiter ID:', recruiterId);
            if (!recruiterId) return res.status(401).json({ message: 'User not authenticated' });

            const { applicationId, date, durationMinutes, notes, type, status } = req.body;
            console.log('Request body:', req.body);

            if (!applicationId || !date || typeof durationMinutes !== 'number') {
                return res.status(400).json({
                    message: 'applicationId, date and durationMinutes are required',
                });
            }

            const interview = await this.interviewService.addInterview({
                applicationId,
                date,
                durationMinutes,
                notes,
                type,
                status,
                recruiterId,
            });

            const candidateId = interview.candidateId;
            console.log(candidateId);
            if (candidateId) {
                const interviewDate = new Date(date);
                const dateStr = interviewDate.toLocaleDateString();
                const timeStr = interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const opportunityTitle = interview?.opportunity?.OpportunityVersions?.[0]?.title || 'the job';

                await emitNotification({
                    senderId: process.env.SYSTEM_USER_ID!,
                    receiverId: candidateId,
                    type: NotificationTypes.INTERVIEW_SCHEDULED,
                    content: `Your interview for "${opportunityTitle}" has been scheduled on ${dateStr} at ${timeStr}.`,
                });
            }

            return res.status(201).json(interview);
        } catch (err) {
            console.error('Error in addInterview:', err);
            next(err);
        }
    };

    private getRecruiterInterviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const recruiterId = (req as any).user?._id;
            if (!recruiterId) return res.status(401).json({ message: 'User not authenticated' });

            const interviews = await this.interviewService.getInterviewsByRecruiter(recruiterId);
            return res.status(200).json(interviews);
        } catch (err) {
            next(err);
        }
    };
    private deleteInterview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const recruiterId = (req as any).user?._id;
            if (!recruiterId) return res.status(401).json({ message: 'User not authenticated' });

            const { id } = req.params;

            const interview = await this.interviewService.getInterviewById(id);
            if (!interview) {
                return res.status(404).json({ message: 'Interview not found' });
            }

            if (interview.recruiterId !== recruiterId) {
                return res.status(403).json({ message: 'Not authorized to delete this interview' });
            }

            const deleted = await this.interviewService.deleteInterview(id, recruiterId);
            if (!deleted) {
                return res.status(404).json({ message: 'Interview not found or already deleted' });
            }

            const candidateId = interview.candidateId;
            if (candidateId) {
                const interviewDate = new Date(interview.date);
                const dateStr = interviewDate.toLocaleDateString();
                const timeStr = interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const opportunityTitle = interview?.opportunity?.OpportunityVersions?.[0]?.title || 'the job';

                await emitNotification({
                    senderId: process.env.SYSTEM_USER_ID!,
                    receiverId: candidateId,
                    type: NotificationTypes.INTERVIEW_CANCELLED,
                    content: `Your interview for "${opportunityTitle}" scheduled on ${dateStr} at ${timeStr} has been cancelled.`,
                });
            }

            return res.status(200).json({ message: 'Interview cancelled successfully' });
        } catch (err) {
            next(err);
        }
    };
    private updateInterview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const recruiterId = (req as any).user?._id;
            if (!recruiterId) return res.status(401).json({ message: 'User not authenticated' });

            const { id } = req.params;
            const { date, durationMinutes, notes, type, status } = req.body;

            const existing = await this.interviewService.getInterviewById(id);
            if (!existing) return res.status(404).json({ message: 'Interview not found' });

            if (existing.recruiterId !== recruiterId) {
                return res.status(403).json({ message: 'Not authorized to update this interview' });
            }

            const updated = await this.interviewService.updateInterview(id, {
                date,
                durationMinutes,
                notes,
                type,
                status,
            });

            const candidateId = updated?.candidateId;
            if (candidateId && date && new Date(date).getTime() !== new Date(existing.date).getTime()) {
                const interviewDate = new Date(date);
                const dateStr = interviewDate.toLocaleDateString();
                const timeStr = interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const opportunityTitle = updated?.opportunity?.OpportunityVersions?.[0]?.title || 'the job';

                await emitNotification({
                    senderId: process.env.SYSTEM_USER_ID!,
                    receiverId: candidateId,
                    type: NotificationTypes.INTERVIEW_SCHEDULED, 
                    content: `Your interview for "${opportunityTitle}" has been rescheduled to ${dateStr} at ${timeStr}.`,
                });
            }

            return res.status(200).json(updated);
        } catch (err) {
            console.error('Error in updateInterview:', err);
            next(err);
        }
    };
    private getInterviewById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const recruiterId = (req as any).user?._id;
            if (!recruiterId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const { id } = req.params;

            const interview = await this.interviewService.getInterviewById(id);
            if (!interview) {
                return res.status(404).json({ message: 'Interview not found' });
            }

            if (interview.recruiterId !== recruiterId) {
                return res.status(403).json({ message: 'Not authorized to view this interview' });
            }

            return res.status(200).json(interview);
        } catch (err) {
            next(err);
        }
    };
    private getCandidateInterviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const candidateId = (req as any).user?._id;
            console.log("cand",candidateId);

            if (!candidateId) return res.status(401).json({ message: 'User not authenticated' });

            const queries = req.query;
            const result = await this.interviewService.getInterviewsByCandidate(candidateId, queries);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

export default InterviewController;
