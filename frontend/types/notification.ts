
export interface Notification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    user: {
        id: number;
        name: string;
        email: string
    }
}


export interface NotificationResponse {
    success: boolean;
    message: string;
    page: number;
    limit: number;
    skip: number;
    total: number;
}