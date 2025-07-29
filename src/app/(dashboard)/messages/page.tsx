'use client'

import { useState, useEffect } from 'react'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Clock, 
  CheckCheck,
  MoreVertical,
  PaperclipIcon
} from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantCompany?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: '2',
    participantName: 'Maria Rodriguez',
    participantCompany: 'Rodriguez Construction LLC',
    lastMessage: 'Thanks for the project information. I\'d like to discuss partnership opportunities.',
    lastMessageTime: '2024-01-15T10:30:00Z',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: '2',
        senderName: 'Maria Rodriguez',
        content: 'Hi! I saw your profile and would love to connect about potential collaboration opportunities.',
        timestamp: '2024-01-15T09:00:00Z',
        isRead: true
      },
      {
        id: 'm2',
        senderId: '1',
        senderName: 'Current User',
        content: 'Hello Maria! I\'d be happy to discuss collaboration. We\'re always looking for reliable partners.',
        timestamp: '2024-01-15T09:15:00Z',
        isRead: true
      },
      {
        id: 'm3',
        senderId: '2',
        senderName: 'Maria Rodriguez',
        content: 'Great! Here\'s some information about our latest project requirements...',
        timestamp: '2024-01-15T10:00:00Z',
        isRead: true
      },
      {
        id: 'm4',
        senderId: '2',
        senderName: 'Maria Rodriguez',
        content: 'Thanks for the project information. I\'d like to discuss partnership opportunities.',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false
      }
    ]
  },
  {
    id: '2',
    participantId: '3',
    participantName: 'James Chen',
    participantCompany: 'Chen HVAC Services',
    lastMessage: 'Perfect! I can start next Tuesday. Should we schedule a site visit?',
    lastMessageTime: '2024-01-14T16:45:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderId: '3',
        senderName: 'James Chen',
        content: 'Hi! I\'m interested in the HVAC project you posted. Are you still looking for contractors?',
        timestamp: '2024-01-14T15:00:00Z',
        isRead: true
      },
      {
        id: 'm6',
        senderId: '1',
        senderName: 'Current User',
        content: 'Yes, we are! Your experience with heat pumps is exactly what we need. When would you be available?',
        timestamp: '2024-01-14T15:30:00Z',
        isRead: true
      },
      {
        id: 'm7',
        senderId: '3',
        senderName: 'James Chen',
        content: 'Perfect! I can start next Tuesday. Should we schedule a site visit?',
        timestamp: '2024-01-14T16:45:00Z',
        isRead: true
      }
    ]
  },
  {
    id: '3',
    participantId: '4',
    participantName: 'Sarah Williams',
    participantCompany: 'Williams Electrical Co.',
    lastMessage: 'The electrical permits have been approved. We can proceed with the installation.',
    lastMessageTime: '2024-01-13T14:20:00Z',
    unreadCount: 1,
    messages: [
      {
        id: 'm8',
        senderId: '4',
        senderName: 'Sarah Williams',
        content: 'Hello! I have updates on the solar installation project permits.',
        timestamp: '2024-01-13T14:00:00Z',
        isRead: true
      },
      {
        id: 'm9',
        senderId: '4',
        senderName: 'Sarah Williams',
        content: 'The electrical permits have been approved. We can proceed with the installation.',
        timestamp: '2024-01-13T14:20:00Z',
        isRead: false
      }
    ]
  }
]

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load conversations
  useEffect(() => {
    setTimeout(() => {
      setConversations(mockConversations)
      setSelectedConversation(mockConversations[0])
      setIsLoading(false)
    }, 500)
  }, [])

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participantCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: user?.id || '1',
      senderName: `${user?.firstName} ${user?.lastName}` || 'Current User',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    }

    // Update conversation with new message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: message.timestamp
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: message.timestamp
    })
    setNewMessage('')
  }

  const handleMarkAsRead = (conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
        }
      }
      return conv
    })
    setConversations(updatedConversations)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  if (isLoading) {
    return (
      <AuthRequiredRoute>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namc-blue-600 mx-auto mb-4"></div>
            <p className="text-namc-gray-600">Loading messages...</p>
          </div>
        </div>
      </AuthRequiredRoute>
    )
  }

  return (
    <AuthRequiredRoute>
      <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-namc-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-namc-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-namc-blue-600" />
                <h1 className="text-lg font-semibold text-namc-gray-900">Messages</h1>
                {totalUnreadCount > 0 && (
                  <Badge className="ml-2 bg-namc-red-500 text-white">
                    {totalUnreadCount}
                  </Badge>
                )}
              </div>
              <Button size="sm" className="bg-namc-blue-600 hover:bg-namc-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-namc-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation)
                  if (conversation.unreadCount > 0) {
                    handleMarkAsRead(conversation.id)
                  }
                }}
                className={`p-4 border-b border-namc-gray-100 cursor-pointer hover:bg-namc-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-namc-blue-50 border-l-4 border-l-namc-blue-600' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-namc-blue-600 text-white text-sm">
                      {conversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-namc-gray-900 truncate text-sm">
                        {conversation.participantName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-namc-blue-600 text-white text-xs px-2 py-1">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-namc-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    {conversation.participantCompany && (
                      <p className="text-xs text-namc-gray-600 mb-1 truncate">
                        {conversation.participantCompany}
                      </p>
                    )}
                    <p className="text-sm text-namc-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-namc-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-namc-blue-600 text-white">
                        {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-namc-gray-900">
                        {selectedConversation.participantName}
                      </h2>
                      {selectedConversation.participantCompany && (
                        <p className="text-sm text-namc-gray-600">
                          {selectedConversation.participantCompany}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => {
                  const isCurrentUser = message.senderId === (user?.id || '1')
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-namc-blue-600 text-white'
                            : 'bg-namc-gray-100 text-namc-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center mt-1 text-xs ${
                          isCurrentUser ? 'text-namc-blue-200' : 'text-namc-gray-500'
                        }`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(message.timestamp)}
                          {isCurrentUser && message.isRead && (
                            <CheckCheck className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-namc-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <Button variant="ghost" size="sm" className="mb-2">
                    <PaperclipIcon className="w-4 h-4" />
                  </Button>
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="mb-2 bg-namc-blue-600 hover:bg-namc-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-namc-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-namc-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-namc-gray-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthRequiredRoute>
  )
}