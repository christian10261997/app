import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { AdminResponse, CreateMessageRequest, Message, MessageCategory, MessageFilters, MessagePriority, MessageStats, MessageStatus } from "../types/message";
import { useFirestore } from "./useFirestore";

export function useMessages() {
  const { userProfile } = useAuthContext();
  const { addDocument, updateDocument, searchDocuments, getDocuments } = useFirestore();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Create a new message (for users)
  const createMessage = useCallback(
    async (messageData: CreateMessageRequest) => {
      if (!userProfile) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        setLoading(true);

        const newMessage: Omit<Message, "id"> = {
          userId: userProfile.id,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          subject: messageData.subject,
          content: messageData.content,
          category: messageData.category,
          priority: messageData.priority,
          status: "unread",
          createdAt: new Date(),
          updatedAt: new Date(),
          // attachments: messageData.attachments ? await uploadAttachments(messageData.attachments) : undefined,
        };

        const result = await addDocument("support_messages", newMessage);

        if (result.success) {
          showToast({
            type: "success",
            title: "Message Sent",
            message: "We'll respond as soon as possible.",
          });

          return { success: true, messageId: result.id };
        } else {
          return { success: false, error: result.error || "Failed to send message" };
        }
      } catch (error: any) {
        console.error("Error creating message:", error);
        return { success: false, error: error.message || "Failed to send message" };
      } finally {
        setLoading(false);
      }
    },
    [userProfile, addDocument, showToast]
  );

  // Load messages for current user
  const loadUserMessages = useCallback(async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const result = await searchDocuments("support_messages", [{ field: "userId", operator: "==", value: userProfile.id }]);

      if (result.success && result.data) {
        const userMessages = result.data.map((doc: any) => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(doc.updatedAt),
          respondedAt: doc.respondedAt?.toDate ? doc.respondedAt.toDate() : doc.respondedAt ? new Date(doc.respondedAt) : undefined,
        })) as Message[];

        // Sort by creation date (newest first)
        userMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setMessages(userMessages);
      } else {
        // If no data or failed, set empty array
        setMessages([]);
      }
    } catch (error) {
      console.log("🚀 ~ useMessages ~ error:", error);
      console.error("Error loading user messages:", error);
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userProfile, searchDocuments]);

  // Load all messages (for admin)
  const loadAllMessages = useCallback(
    async (filters?: MessageFilters) => {
      try {
        setLoading(true);

        let searchFilters: any[] = [];

        // Apply filters
        if (filters?.status && filters.status.length > 0) {
          searchFilters.push({ field: "status", operator: "in", value: filters.status });
        }

        if (filters?.category && filters.category.length > 0) {
          searchFilters.push({ field: "category", operator: "in", value: filters.category });
        }

        const result = searchFilters.length > 0 ? await searchDocuments("support_messages", searchFilters) : await getDocuments("support_messages");

        if (result.success && result.data) {
          let allMessages = result.data.map((doc: any) => ({
            id: doc.id,
            ...doc,
            createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
            updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(doc.updatedAt),
            respondedAt: doc.respondedAt?.toDate ? doc.respondedAt.toDate() : doc.respondedAt ? new Date(doc.respondedAt) : undefined,
          })) as Message[];

          // Apply search term filter
          if (filters?.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            allMessages = allMessages.filter(
              (message) =>
                message.subject.toLowerCase().includes(searchTerm) ||
                message.content.toLowerCase().includes(searchTerm) ||
                message.userName.toLowerCase().includes(searchTerm) ||
                message.userEmail.toLowerCase().includes(searchTerm)
            );
          }

          // Apply date range filter
          if (filters?.dateRange) {
            allMessages = allMessages.filter((message) => message.createdAt >= filters.dateRange!.start && message.createdAt <= filters.dateRange!.end);
          }

          // Sort by creation date (newest first)
          allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          setMessages(allMessages);

          // Calculate stats
          calculateStats(allMessages);
        } else {
          // If no data or failed, set empty array and empty stats
          setMessages([]);
          setStats({
            totalMessages: 0,
            unreadMessages: 0,
            respondedMessages: 0,
            averageResponseTime: 0,
            messagesByCategory: {} as Record<MessageCategory, number>,
            messagesByPriority: {} as Record<MessagePriority, number>,
          });
        }
      } catch (error) {
        console.error("Error loading all messages:", error);
        setMessages([]); // Set empty array on error
        setStats(null); // Reset stats on error
      } finally {
        setLoading(false);
      }
    },
    [searchDocuments, getDocuments]
  );

  // Respond to a message (admin only)
  const respondToMessage = useCallback(
    async (adminResponse: AdminResponse) => {
      if (!userProfile || userProfile.userType !== "admin") {
        return { success: false, error: "Admin access required" };
      }

      try {
        setLoading(true);

        const updateData = {
          adminResponse: adminResponse.response,
          adminId: userProfile.id,
          adminName: `${userProfile.firstName} ${userProfile.lastName}`,
          respondedAt: new Date(),
          status: "responded" as MessageStatus,
          updatedAt: new Date(),
        };

        const result = await updateDocument("support_messages", adminResponse.messageId, updateData);

        if (result.success) {
          showToast({
            type: "success",
            title: "Response Sent",
            message: "Your response has been sent to the user.",
          });

          // Refresh messages
          loadAllMessages();

          return { success: true };
        } else {
          return { success: false, error: result.error || "Failed to send response" };
        }
      } catch (error: any) {
        console.error("Error responding to message:", error);
        return { success: false, error: error.message || "Failed to send response" };
      } finally {
        setLoading(false);
      }
    },
    [userProfile, updateDocument, showToast, loadAllMessages]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const updateData = {
          status: "read" as MessageStatus,
          updatedAt: new Date(),
        };

        await updateDocument("support_messages", messageId, updateData);

        // Update local state
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "read", updatedAt: new Date() } : msg)));
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    },
    [updateDocument]
  );

  // Calculate statistics
  const calculateStats = useCallback((messageList: Message[]) => {
    const totalMessages = messageList.length;
    const unreadMessages = messageList.filter((msg) => msg.status === "unread").length;
    const respondedMessages = messageList.filter((msg) => msg.status === "responded").length;

    // Calculate average response time for responded messages
    const respondedWithTimes = messageList.filter((msg) => msg.status === "responded" && msg.respondedAt);
    const averageResponseTime =
      respondedWithTimes.length > 0
        ? respondedWithTimes.reduce((acc, msg) => {
            const timeDiff = msg.respondedAt!.getTime() - msg.createdAt.getTime();
            return acc + timeDiff / (1000 * 60 * 60); // Convert to hours
          }, 0) / respondedWithTimes.length
        : 0;

    // Count by category
    const messagesByCategory = messageList.reduce((acc, msg) => {
      acc[msg.category] = (acc[msg.category] || 0) + 1;
      return acc;
    }, {} as Record<MessageCategory, number>);

    setStats({
      totalMessages,
      unreadMessages,
      respondedMessages,
      averageResponseTime,
      messagesByCategory,
      messagesByPriority: {} as Record<MessagePriority, number>, // Empty since we removed priority
    });
  }, []);

  // Auto-load messages on mount
  useEffect(() => {
    if (userProfile && !initialized) {
      setInitialized(true);
      if (userProfile.userType === "admin") {
        loadAllMessages();
      } else {
        loadUserMessages();
      }
    }
  }, [userProfile?.id, userProfile?.userType, initialized]); // Only depend on user ID and type, not the functions

  return {
    messages,
    loading,
    stats,
    createMessage,
    loadUserMessages,
    loadAllMessages,
    respondToMessage,
    markAsRead,
  };
}
