"use client";

export const messageQueryKeys = {
  all: ["messages"] as const,

  conversations: () => [...messageQueryKeys.all, "conversations"] as const,
  conversationMessages: (conversationId: number) =>
    [...messageQueryKeys.all, "conversation", conversationId, "messages"] as const,

  groupsAll: () => [...messageQueryKeys.all, "groups", "all"] as const,
  myGroups: () => [...messageQueryKeys.all, "groups", "me"] as const,
  groupMessages: (groupId: number) =>
    [...messageQueryKeys.all, "groups", groupId, "messages"] as const,
  groupMembers: (groupId: number) =>
    [...messageQueryKeys.all, "groups", groupId, "members"] as const,
} as const;

export const messageMutationKeys = {
  sendPersonalMessage: ["messages", "sendPersonalMessage"] as const,
  sendGroupMessage: ["messages", "sendGroupMessage"] as const,
  createGroup: ["messages", "createGroup"] as const,
  addGroupMember: ["messages", "addGroupMember"] as const,
} as const;

