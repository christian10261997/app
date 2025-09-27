export type MessageStatus = "unread" | "read" | "responded";

export type MessagePriority = "low" | "medium" | "high" | "urgent";

export type MessageCategory = "general_inquiry" | "technical_support" | "subscription_issue" | "account_help" | "feature_request" | "bug_report" | "billing_question" | "other";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  content: string;
  category: MessageCategory;
  priority: MessagePriority;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;

  // Admin response fields
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
  respondedAt?: Date;

  // Additional metadata
  attachments?: string[]; // URLs to uploaded files if needed
}

export interface CreateMessageRequest {
  subject: string;
  content: string;
  category: MessageCategory;
  priority: MessagePriority;
  attachments?: File[];
}

export interface AdminResponse {
  messageId: string;
  response: string;
}

export interface MessageFilters {
  status?: MessageStatus[];
  category?: MessageCategory[];
  priority?: MessagePriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  respondedMessages: number;
  averageResponseTime: number; // in hours
  messagesByCategory: Record<MessageCategory, number>;
  messagesByPriority: Record<MessagePriority, number>;
}
