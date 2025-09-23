const notificationPreferences = new Map<string, boolean>();

export function setNotificationsEnabled(userId: string, enabled: boolean) {
    notificationPreferences.set(userId, enabled);
}

export function areNotificationsEnabled(userId: string): boolean {
    return notificationPreferences.get(userId) ?? true; 
}
