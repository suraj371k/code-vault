"use client"

import ChatList from '@/components/teams/chat-list'
import ChatWindow from '@/components/teams/chat-window'
import GroupChatWindow from '@/components/teams/group-chat-window'
import { useProfile } from '@/hooks/auth/useProfile'
import { Conversation } from '@/types/conversations'
import { MessageCircle } from 'lucide-react'
import React, { useState } from 'react'

const Teams = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [activeGroup, setActiveGroup] = useState<{ id: number; name: string } | null>(null)

  const { data: profile } = useProfile()
  const currentUserId = profile?.id ? Number(profile.id) : undefined

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv)
    setActiveGroup(null)
  }

  const handleSelectGroup = (group: { id: number; name: string }) => {
    setActiveGroup(group)
    setActiveConversation(null)
  }

  return (
    // Escape the layout's p-4 by using negative margin, then fill the exact remaining height
    <div
      className="-m-4 flex overflow-hidden rounded-xl border"
      style={{
        height: 'calc(100vh - 4rem)',
        borderColor: 'rgba(20,184,166,0.12)',
        background: '#0a0a0f',
      }}
    >
      {/* Chat list sidebar */}
      <div
        className="w-72 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ borderColor: 'rgba(20,184,166,0.1)' }}
      >
        <ChatList
          onSelect={handleSelectConversation}
          onSelectGroup={handleSelectGroup}
          selectedId={activeConversation?.id}
          selectedGroupId={activeGroup?.id}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            currentUserId={currentUserId}
          />
        ) : activeGroup ? (
          <GroupChatWindow
            group={activeGroup}
            currentUserId={currentUserId}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(20,184,166,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="relative size-16 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(6,182,212,0.05))',
          border: '1px solid rgba(20,184,166,0.18)',
          boxShadow: '0 0 32px rgba(20,184,166,0.08)',
        }}
      >
        <MessageCircle className="size-7 text-teal-500/80" strokeWidth={1.5} />
      </div>
      <div className="relative">
        <p className="text-[15px] font-semibold text-zinc-300">Select a conversation</p>
        <p className="text-[12.5px] text-zinc-600 mt-1 max-w-[220px]">
          Choose from the left panel to start messaging
        </p>
      </div>
      <div className="relative flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full"
            style={{
              background: 'rgba(20,184,166,0.25)',
              animationName: 'dot-bounce',
              animationDuration: '1.4s',
              animationDelay: `${i * 0.2}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Teams
