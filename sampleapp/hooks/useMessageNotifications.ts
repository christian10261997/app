import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useFirestore } from "./useFirestore";

export function useMessageNotifications() {
  const { userProfile } = useAuthContext();
  const { searchDocuments } = useFirestore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const checkForNewMessages = async () => {
    if (!userProfile) return;

    try {
      if (userProfile.userType === "admin") {
        // Check for unread support messages for admin
        const result = await searchDocuments("support_messages", [{ field: "status", operator: "==", value: "unread" }]);

        if (result.success && result.data) {
          const newUnreadCount = result.data.length;
          setHasNewMessages(newUnreadCount > unreadCount);
          setUnreadCount(newUnreadCount);
        }
      } else {
        // Check for new responses for regular users
        const result = await searchDocuments("support_messages", [
          { field: "userId", operator: "==", value: userProfile.id },
          { field: "status", operator: "==", value: "responded" },
        ]);

        if (result.success && result.data) {
          // Check if there are any responses the user hasn't seen yet
          // This is a simplified check - in a real app you'd track read status for responses
          const respondedMessages = result.data.filter((doc: any) => doc.adminResponse && doc.respondedAt);

          const newResponseCount = respondedMessages.length;
          setHasNewMessages(newResponseCount > 0);
          setUnreadCount(newResponseCount);
        }
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  };

  const markMessagesAsChecked = () => {
    setHasNewMessages(false);
  };

  useEffect(() => {
    if (userProfile) {
      // Initial check
      checkForNewMessages();

      // Set up periodic checking (every 30 seconds)
      const interval = setInterval(checkForNewMessages, 30000);

      return () => clearInterval(interval);
    }
  }, [userProfile]);

  return {
    unreadCount,
    hasNewMessages,
    checkForNewMessages,
    markMessagesAsChecked,
  };
}
