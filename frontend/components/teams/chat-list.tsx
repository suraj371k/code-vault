"use client"

import { useGetConversations } from '@/hooks/teams/useGetConversations'
import { useProfile } from '@/hooks/auth/useProfile'
import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Conversation } from '@/types/conversations'
import { MessageCircle, Search, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'


function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0f766e, #0d9488)',
  'linear-gradient(135deg, #0e7490, #0891b2)',
  'linear-gradient(135deg, #4338ca, #6366f1)',
  'linear-gradient(135deg, #0f766e, #06b6d4)',
  'linear-gradient(135deg, #065f46, #059669)',
]
function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]
}
function getOtherParticipants(conversation: Conversation, myId: number) {
  const others = conversation.participants.filter(
    (p) => Number(p.userId) !== myId
  )
  return others.length > 0 ? others : conversation.participants
}


function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
      <div className="size-10 rounded-full shrink-0" style={{ background: 'rgba(20,184,166,0.08)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-2.5 w-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div className="h-2.5 w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  myId: number
}

function ConversationItem({ conversation, isActive, onClick, myId }: ConversationItemProps) {
  const others = getOtherParticipants(conversation, myId)
  const primaryParticipant = others[0]
  const extraCount = others.length - 1

  const lastMessage = conversation.messages?.[0]

  const lastMsgPrefix =
    lastMessage && Number(lastMessage.senderId) === myId
      ? 'You'
      : (lastMessage?.sender?.name ?? null)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-left',
        isActive
          ? 'border border-teal-500/25'
          : 'border border-transparent hover:border-teal-900/40'
      )}
      style={
        isActive
          ? {
              background: 'linear-gradient(120deg, rgba(20,184,166,0.10) 0%, rgba(6,182,212,0.05) 100%)',
              boxShadow: '0 0 20px rgba(20,184,166,0.07)',
            }
          : { background: 'transparent' }
      }
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
          style={{
            height: '55%',
            background: 'linear-gradient(180deg, #2dd4bf, #5eead4)',
            boxShadow: '0 0 8px 2px rgba(45,212,191,0.55)',
          }}
        />
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          className="size-10"
          style={{
            boxShadow: isActive
              ? '0 0 0 1px rgba(20,184,166,0.4)'
              : '0 0 0 1px rgba(255,255,255,0.06)',
          }}
        >
          <AvatarFallback
            className="text-[11px] font-bold text-teal-100"
            style={{ background: avatarGradient(primaryParticipant?.userId ?? 0) }}
          >
            {primaryParticipant ? getInitials(primaryParticipant.user.name) : '??'}
          </AvatarFallback>
        </Avatar>

        {extraCount > 0 && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full text-[9px] font-bold text-teal-100 border border-[#0a0a0f]"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            +{extraCount}
          </span>
        )}

        <span
          className="absolute top-0 right-0 size-2.5 rounded-full border-[1.5px] border-[#0a0a0f]"
          style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          {/* Only the OTHER person's name — never your own */}
          <p
            className={cn(
              'text-[13px] font-semibold truncate leading-none',
              isActive ? 'text-teal-100' : 'text-zinc-200 group-hover:text-zinc-100'
            )}
          >
            {others.map((p) => p.user.name).join(', ')}
          </p>

          {lastMessage && (
            <span className="text-[10px] text-zinc-600 shrink-0 flex items-center gap-0.5">
              <Clock className="size-2.5" strokeWidth={1.8} />
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <p className={cn(
          'text-[11.5px] truncate mt-1 leading-none',
          isActive ? 'text-teal-400/70' : 'text-zinc-500 group-hover:text-zinc-400'
        )}>
          {lastMessage
            ? `${lastMsgPrefix}: ${lastMessage.content}`
            : 'No messages yet'}
        </p>
      </div>
    </button>
  )
}

/*  main component  */

interface ChatListProps {
  onSelect?: (conversation: Conversation) => void
  selectedId?: number
  currentUserId?: number
}

const ChatList = ({ onSelect, selectedId, currentUserId: externalId }: ChatListProps) => {
  const { data: profile } = useProfile()
  const myId = profile?.id ? Number(profile.id) : externalId

  const { data: conversations, isPending, error } = useGetConversations()
  const [search, setSearch] = useState('')

  const list = conversations?.data ?? []

  const filtered = search.trim() && myId
    ? list.filter((c) => {
        const others = getOtherParticipants(c, myId)
        return others.some(
          (p) =>
            p.user.name.toLowerCase().includes(search.toLowerCase()) ||
            p.user.email.toLowerCase().includes(search.toLowerCase())
        )
      })
    : list

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#0a0a0f' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-teal-950/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-teal-500" strokeWidth={2} />
            <h2 className="text-[13px] font-bold tracking-wide text-zinc-100">Messages</h2>
          </div>
          {list.length > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(20,184,166,0.15)',
                color: '#2dd4bf',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              {list.length}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors duration-200 focus-within:border-teal-500/40"
          style={{ background: 'rgba(20,184,166,0.04)', borderColor: 'rgba(20,184,166,0.12)' }}
        >
          <Search className="size-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[12px] text-zinc-300 placeholder:text-zinc-600 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {(isPending || !myId) && Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}

        {error && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
            <div
              className="size-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <MessageCircle className="size-4 text-red-500/70" strokeWidth={1.8} />
            </div>
            <p className="text-[12px] text-red-400/80 font-medium">Failed to load</p>
            <p className="text-[11px] text-zinc-600">{error.message}</p>
          </div>
        )}

        {!isPending && myId && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <div
              className="size-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.04))',
                border: '1px solid rgba(20,184,166,0.15)',
              }}
            >
              <MessageCircle className="size-5 text-teal-600" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-zinc-400">
                {search ? 'No results found' : 'No conversations yet'}
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {search ? 'Try a different name or email' : 'Start a chat with a team member'}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Only render when myId is known — guarantees filtering always works */}
        {!isPending && myId && !error && filtered.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={selectedId === conversation.id}
            onClick={() => onSelect?.(conversation)}
            myId={myId}
          />
        ))}
      </div>
    </div>
  )
}

export default ChatList
