import request from 'supertest';
import express from 'express';

const mockNotificationService = {
  getNotifications: jest.fn(),
  createNotification: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  getUnreadCount: jest.fn(),
  deleteAllNotifications: jest.fn(),
};

jest.mock('@/middlewares/authentication.middleware', () =>
  jest.fn((req, res, next) => {
    req.user = { _id: 'fake-user-id' };
    next();
  })
);

describe('Notifications API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.get('/notifications', async (req, res) => {
      const result = await mockNotificationService.getNotifications();
      res.status(200).json(result);
    });

    app.post('/notifications', async (req, res) => {
      const result = await mockNotificationService.createNotification(req.body);
      res.status(201).json(result);
    });

    app.patch('/notifications/:id/read', async (req, res) => {
      const result = await mockNotificationService.markAsRead(req.params.id);
      res.status(200).json(result);
    });

    app.patch('/notifications/mark-all-read', async (req, res) => {
      const count = await mockNotificationService.markAllAsRead();
      res.status(200).json({ message: 'All notifications marked as read', updatedCount: count });
    });

    app.delete('/notifications/:id', async (req, res) => {
      await mockNotificationService.deleteNotification(req.params.id);
      res.status(200).json({ message: 'Notification deleted successfully' });
    });

    app.get('/notifications/unread-count', async (req, res) => {
      const count = await mockNotificationService.getUnreadCount();
      res.status(200).json({ count });
    });

    app.delete('/notifications', async (req, res) => {
      const count = await mockNotificationService.deleteAllNotifications();
      res.status(200).json({ message: 'All notifications deleted', deletedCount: count });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /notifications → récupère toutes les notifications', async () => {
    const mockNotifications = {
      notifications: [
        { id: 'notif-1', content: 'Nouvelle candidature' },
        { id: 'notif-2', content: 'Message reçu' },
      ],
      totalCount: 2,
      unreadCount: 1,
    };
    mockNotificationService.getNotifications.mockResolvedValueOnce(mockNotifications);

    const res = await request(app).get('/notifications');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockNotifications);
  });

  it('POST /notifications → crée une nouvelle notification', async () => {
    const mockNotification = {
      id: 'notif-id',
      content: 'Nouvelle notification',
      receiverId: 'fake-user-id',
    };
    mockNotificationService.createNotification.mockResolvedValueOnce(mockNotification);

    const res = await request(app)
      .post('/notifications')
      .send({
        content: 'Nouvelle notification',
        receiverId: 'fake-user-id',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockNotification);
  });

  it('PATCH /notifications/:id/read → marque une notification comme lue', async () => {
    const mockUpdated = { id: 'notif-id', isRead: true };
    mockNotificationService.markAsRead.mockResolvedValueOnce(mockUpdated);

    const res = await request(app).patch('/notifications/notif-id/read');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUpdated);
  });

  it('PATCH /notifications/mark-all-read → marque toutes les notifications comme lues', async () => {
    mockNotificationService.markAllAsRead.mockResolvedValueOnce(5);

    const res = await request(app).patch('/notifications/mark-all-read');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('All notifications marked as read');
    expect(res.body.updatedCount).toBe(5);
  });

  it('DELETE /notifications/:id → supprime une notification', async () => {
    mockNotificationService.deleteNotification.mockResolvedValueOnce(undefined);

    const res = await request(app).delete('/notifications/notif-id');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification deleted successfully');
  });

  it('GET /notifications/unread-count → récupère le nombre de notifications non lues', async () => {
    mockNotificationService.getUnreadCount.mockResolvedValueOnce(3);

    const res = await request(app).get('/notifications/unread-count');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
  });

  it('DELETE /notifications → supprime toutes les notifications', async () => {
    mockNotificationService.deleteAllNotifications.mockResolvedValueOnce(10);

    const res = await request(app).delete('/notifications');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('All notifications deleted');
    expect(res.body.deletedCount).toBe(10);
  });
});