
const connectedUsers: Record<string, Set<string>> = {};

export function addUser(userId: string, socketId: string) {
  if (!connectedUsers[userId]) {
    connectedUsers[userId] = new Set();
  }
  connectedUsers[userId].add(socketId);
}

export function removeUser(userId: string, socketId: string) {
  if (connectedUsers[userId]) {
    connectedUsers[userId].delete(socketId);

    if (connectedUsers[userId].size === 0) {
      delete connectedUsers[userId];
    }
  }
}

export function getSocketIds(userId: string): string[] {
  return Array.from(connectedUsers[userId] || []);
}

export function getOnlineUsers(): string[] {
  return Object.keys(connectedUsers);
}
