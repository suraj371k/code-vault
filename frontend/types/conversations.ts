export type GroupRole = "OWNER" | "MEMBER";

export interface ApiSuccess<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface UserLite {
  id: number;
  name: string;
  email: string;
}

export interface ConversationMember {
  userId: number;
  conversationId: number;
  user: UserLite;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  groupId?: number | null;
  createdAt: string;
  sender?: UserLite;
}

export interface Conversation {
  id: number;
  createdAt: string;
  participants: ConversationMember[];
  messages: Message[];
}

export interface GroupMember {
  userId: number;
  groupId: number;
  role: GroupRole;
  joinedAt: string;
  user: UserLite;
}

export interface Group {
  id: number;
  name: string;
  organizationId: number;
  conversationId?: number | null;
  members?: GroupMember[];
}

// ====== Backend response shapes (messages controller) ======

export type GetUserConversationsResponse = ApiSuccess<Conversation[]>;
export type GetConversationMessagesResponse = ApiSuccess<Message[]>;

export type GetUserGroupsResponse = ApiSuccess<Group[]>;
export type GetGroupsResponse = ApiSuccess<Group[]>;

export type GetGroupMessagesResponse = ApiSuccess<Message[]>;

export interface GetGroupMembersResponse extends ApiSuccess<GroupMember[]> {
  message: string;
  count: number;
}

export interface CreateGroupInput {
  name: string;
}
export type CreateGroupResponse = ApiSuccess<Group>;

export interface AddGroupMemberInput {
  email: string;
}
export interface AddGroupMemberData {
  userId: number;
  groupId: number;
  role: GroupRole;
  joinedAt: string;
}
export interface AddGroupMemberResponse {
  success: boolean;
  message: string;
  data: AddGroupMemberData;
}

export interface SendMessageInput {
  content: string;
}

export interface SendPersonalMessageResponse {
  success: boolean;
  data: {
    message: Message & { sender: UserLite };
    receiver: UserLite;
  };
}

export interface SendGroupMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

