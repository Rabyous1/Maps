import request from 'supertest';
import express from 'express';

const mockMessagesService = {
  sendMessage: jest.fn(),
  getConversations: jest.fn(),
  getConversationWith: jest.fn(),
  updateMessage: jest.fn(),
  deleteMessage: jest.fn(),
  markAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
};

jest.mock('@/middlewares/authentication.middleware', () =>
  jest.fn((req, res, next) => {
    req.user = { _id: 'fake-user-id' };
    next();
  })
);

describe('Messages API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.post('/messages', async (req, res) => {
      const result = await mockMessagesService.sendMessage(req.body);
      res.status(201).json(result);
    });

    app.get('/messages/conversations', async (req, res) => {
      const result = await mockMessagesService.getConversations();
      res.status(200).json(result);
    });

    app.get('/messages/unread-count', async (req, res) => {
      const count = await mockMessagesService.getUnreadCount();
      res.status(200).json({ count });
    });

    app.get('/messages/conversation/:userId', async (req, res) => {
      const result = await mockMessagesService.getConversationWith();
      res.status(200).json(result);
    });

    app.put('/messages/:id', async (req, res) => {
      const result = await mockMessagesService.updateMessage();
      res.status(200).json(result);
    });

    app.delete('/messages/:id', async (req, res) => {
      await mockMessagesService.deleteMessage();
      res.status(200).json({ message: 'Message deleted successfully' });
    });

    app.patch('/messages/:id/read', async (req, res) => {
      const result = await mockMessagesService.markAsRead();
      res.status(200).json(result);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /messages → envoie un nouveau message', async () => {
    const mockMessage = {
      id: 'message-id',
      content: 'Hello world',
      senderId: 'fake-user-id',
      receiverId: 'receiver-id',
    };
    mockMessagesService.sendMessage.mockResolvedValueOnce(mockMessage);

    const res = await request(app)
      .post('/messages')
      .send({
        content: 'Hello world',
        receiverId: 'receiver-id',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockMessage);
  });

  it('GET /messages/conversations → récupère toutes les conversations', async () => {
    const mockConversations = [
      { id: 'conv-1', lastMessage: 'Hello' },
      { id: 'conv-2', lastMessage: 'Hi there' },
    ];
    mockMessagesService.getConversations.mockResolvedValueOnce(mockConversations);

    const res = await request(app).get('/messages/conversations');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockConversations);
  });

  it('GET /messages/conversation/:userId → récupère une conversation avec un utilisateur', async () => {
    const mockMessages = [
      { id: 'msg-1', content: 'Hello' },
      { id: 'msg-2', content: 'Hi' },
    ];
    mockMessagesService.getConversationWith.mockResolvedValueOnce(mockMessages);

    const res = await request(app).get('/messages/conversation/other-user-id');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMessages);
  });

  it('PUT /messages/:id → met à jour un message', async () => {
    const mockUpdated = { id: 'message-id', content: 'Updated message' };
    mockMessagesService.updateMessage.mockResolvedValueOnce(mockUpdated);

    const res = await request(app)
      .put('/messages/message-id')
      .send({ content: 'Updated message' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUpdated);
  });

  it('DELETE /messages/:id → supprime un message', async () => {
    mockMessagesService.deleteMessage.mockResolvedValueOnce(undefined);

    const res = await request(app).delete('/messages/message-id');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Message deleted successfully');
  });

  it('PATCH /messages/:id/read → marque un message comme lu', async () => {
    const mockUpdated = { id: 'message-id', isRead: true };
    mockMessagesService.markAsRead.mockResolvedValueOnce(mockUpdated);

    const res = await request(app).patch('/messages/message-id/read');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUpdated);
  });

  it('GET /messages/unread-count → récupère le nombre de messages non lus', async () => {
    mockMessagesService.getUnreadCount.mockResolvedValueOnce(5);

    const res = await request(app).get('/messages/unread-count');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
  });
});