<template>
  <div class="chat-container">
    <!-- 左侧会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">聊天记录</h2>
        <button @click="createNewSession" class="new-chat-btn">
          <PlusIcon class="w-5 h-5" />
          新建对话
        </button>
      </div>

      <!-- 会话列表 -->
      <div class="session-list">
        <div v-if="loading" class="loading-sessions">
          <div class="animate-pulse space-y-2">
            <div v-for="i in 5" :key="i" class="h-16 bg-gray-700 rounded-lg"></div>
          </div>
        </div>

        <div v-else-if="sessions.length === 0" class="empty-sessions">
          <div class="text-gray-400 text-center py-8">
            <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无对话记录</p>
            <p class="text-sm">点击"新建对话"开始聊天</p>
          </div>
        </div>

        <div v-else class="space-y-2">
          <!-- 按日期分组显示会话 -->
          <div v-for="(group, date) in groupedSessions" :key="date" class="session-group">
            <div class="date-header">{{ formatDateHeader(date) }}</div>
            <div 
              v-for="session in group" 
              :key="session.id"
              @click="selectSession(session)"
              :class="[
                'session-item',
                { 'active': currentSession?.id === session.id }
              ]"
            >
              <div class="session-content">
                <div class="session-name">{{ session.sessionName }}</div>
                <div class="session-preview">{{ session.lastMessage || '新对话' }}</div>
                <div class="session-time">{{ formatTime(session.updatedAt) }}</div>
              </div>
              <div class="session-actions">
                <button 
                  @click.stop="editSession(session)"
                  class="action-btn"
                  title="重命名"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button 
                  @click.stop="deleteSession(session)"
                  class="action-btn text-red-400 hover:text-red-300"
                  title="删除"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area">
      <div v-if="!currentSession" class="welcome-screen">
        <div class="welcome-content">
          <div class="welcome-icon">
            <ChatBubbleLeftRightIcon class="w-24 h-24 text-blue-500" />
          </div>
          <h1 class="welcome-title">AI 智能助手</h1>
          <p class="welcome-subtitle">选择一个对话或创建新对话开始聊天</p>
          <button @click="createNewSession" class="welcome-btn">
            开始新对话
          </button>
        </div>
      </div>

      <div v-else class="chat-content">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <h3>{{ currentSession.sessionName }}</h3>
            <span class="message-count">{{ messages.length }} 条消息</span>
          </div>
          <div class="chat-actions">
            <button 
              @click="clearMessages"
              class="header-btn"
              title="清空对话"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div ref="messagesContainer" class="messages-container">
          <div v-if="loadingMessages" class="loading-messages">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 3" :key="i" class="flex space-x-3">
                <div class="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="messages-list">
            <div 
              v-for="message in messages" 
              :key="message.id"
              :class="[
                'message',
                message.role === 'user' ? 'user-message' : 'assistant-message'
              ]"
            >
              <div class="message-avatar">
                <UserIcon v-if="message.role === 'user'" class="w-6 h-6" />
                <CpuChipIcon v-else class="w-6 h-6" />
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.createdAt) }}</span>
                  <span v-if="message.executionTime" class="execution-time">
                    {{ message.executionTime }}ms
                  </span>
                  <span v-if="message.tokens" class="token-count">
                    {{ message.tokens }} tokens
                  </span>
                </div>
                <!-- 工具调用结果 -->
                <div v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
                  <div class="tool-calls-header">工具调用结果:</div>
                  <div v-for="(tool, index) in message.toolCalls" :key="index" class="tool-call">
                    <div class="tool-name">{{ tool.tool }}</div>
                    <div class="tool-result">{{ JSON.stringify(tool.result, null, 2) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 正在输入指示器 -->
            <div v-if="isTyping" class="message assistant-message typing-indicator">
              <div class="message-avatar">
                <CpuChipIcon class="w-6 h-6" />
              </div>
              <div class="message-content">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-container">
            <textarea
              ref="messageInput"
              v-model="newMessage"
              @keydown="handleKeyDown"
              @input="adjustTextareaHeight"
              placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
              class="message-input"
              rows="1"
              :disabled="sending"
            ></textarea>
            <button 
              @click="sendMessage"
              :disabled="!newMessage.trim() || sending"
              class="send-btn"
            >
              <PaperAirplaneIcon v-if="!sending" class="w-5 h-5" />
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑会话名称模态框 -->
    <div v-if="editingSession" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">重命名对话</h3>
        <input
          ref="editInput"
          v-model="editSessionName"
          @keydown.enter="saveSessionName"
          @keydown.escape="cancelEdit"
          class="modal-input"
          placeholder="输入新的对话名称"
        />
        <div class="modal-actions">
          <button @click="cancelEdit" class="modal-btn-cancel">取消</button>
          <button @click="saveSessionName" class="modal-btn-confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  CpuChipIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'
import { chatApi } from '../api/chat'
import type { ChatSession, ChatMessage } from '../types/chat'

// 响应式数据
const loading = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const isTyping = ref(false)

const sessions = ref<ChatSession[]>([])
const currentSession = ref<ChatSession | null>(null)
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')

const editingSession = ref<ChatSession | null>(null)
const editSessionName = ref('')

// DOM 引用
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const editInput = ref<HTMLInputElement>()

// 计算属性
const groupedSessions = computed(() => {
  const groups: Record<string, ChatSession[]> = {}
  
  sessions.value.forEach(session => {
    const date = new Date(session.updatedAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
  })
  
  return groups
})

// 生命周期
onMounted(() => {
  loadSessions()
})

// 监听当前会话变化
watch(currentSession, (newSession) => {
  if (newSession) {
    loadMessages(newSession.id)
  }
})

// 方法
async function loadSessions() {
  try {
    loading.value = true
    const response = await chatApi.getSessions({ page: 1, limit: 100 })
    sessions.value = response.sessions
  } catch (error) {
    console.error('加载会话列表失败:', error)
  } finally {
    loading.value = false
  }
}

async function createNewSession() {
  try {
    const sessionName = `对话 ${formatDateYMD(new Date())}`
    const session = await chatApi.createSession({ sessionName })
    sessions.value.unshift(session)
    selectSession(session)
  } catch (error) {
    console.error('创建会话失败:', error)
  }
}

function selectSession(session: ChatSession) {
  currentSession.value = session
  messages.value = []
}

async function loadMessages(sessionId: string) {
  try {
    loadingMessages.value = true
    const response = await chatApi.getMessages(sessionId, { page: 1, limit: 100 })
    messages.value = response.messages
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败:', error)
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentSession.value || sending.value) {
    return
  }

  const messageText = newMessage.value.trim()
  newMessage.value = ''
  adjustTextareaHeight()

  try {
    sending.value = true
    isTyping.value = true

    const response = await chatApi.sendMessage({
      sessionId: currentSession.value.id,
      message: messageText
    })

    // 添加用户消息和AI回复到消息列表
    messages.value.push(response.message, response.response)
    
    // 更新会话的最后消息
    const sessionIndex = sessions.value.findIndex(s => s.id === currentSession.value!.id)
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex].lastMessage = response.response.content.substring(0, 100)
      sessions.value[sessionIndex].updatedAt = Date.now()
    }

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
    isTyping.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function adjustTextareaHeight() {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

function scrollToBottom() {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

function editSession(session: ChatSession) {
  editingSession.value = session
  editSessionName.value = session.sessionName
  nextTick(() => {
    editInput.value?.focus()
  })
}

async function saveSessionName() {
  if (!editingSession.value || !editSessionName.value.trim()) {
    return
  }

  try {
    const updatedSession = await chatApi.updateSession(editingSession.value.id, {
      sessionName: editSessionName.value.trim()
    })

    const index = sessions.value.findIndex(s => s.id === editingSession.value!.id)
    if (index !== -1) {
      sessions.value[index] = updatedSession
    }

    if (currentSession.value?.id === editingSession.value.id) {
      currentSession.value = updatedSession
    }

    cancelEdit()
  } catch (error) {
    console.error('更新会话名称失败:', error)
  }
}

function cancelEdit() {
  editingSession.value = null
  editSessionName.value = ''
}

async function deleteSession(session: ChatSession) {
  if (!confirm('确定要删除这个对话吗？此操作不可撤销。')) {
    return
  }

  try {
    await chatApi.deleteSession(session.id)
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    
    if (currentSession.value?.id === session.id) {
      currentSession.value = null
      messages.value = []
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

async function clearMessages() {
  if (!currentSession.value) return
  
  if (!confirm('确定要清空当前对话的所有消息吗？此操作不可撤销。')) {
    return
  }

  try {
    await chatApi.clearMessages(currentSession.value.id)
    messages.value = []
  } catch (error) {
    console.error('清空消息失败:', error)
  }
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatMessageTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatMessage(content: string): string {
  // 简单的 Markdown 渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function formatDateYMD(date: Date): string {
  return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0')
}
</script>

<style scoped>
.chat-container {
  @apply flex h-screen bg-gray-900 text-white;
}

/* 左侧边栏 */
.sidebar {
  @apply w-80 bg-gray-800 border-r border-gray-700 flex flex-col;
}

.sidebar-header {
  @apply p-4 border-b border-gray-700;
}

.sidebar-title {
  @apply text-xl font-semibold mb-3;
}

.new-chat-btn {
  @apply w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors;
}

.session-list {
  @apply flex-1 overflow-y-auto p-2;
}

.loading-sessions {
  @apply p-2;
}

.empty-sessions {
  @apply flex-1 flex items-center justify-center;
}

.session-group {
  @apply mb-4;
}

.date-header {
  @apply text-xs text-gray-400 font-medium px-3 py-2 sticky top-0 bg-gray-800;
}

.session-item {
  @apply flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors;
}

.session-item.active {
  @apply bg-blue-600 hover:bg-blue-700;
}

.session-content {
  @apply flex-1 min-w-0;
}

.session-name {
  @apply font-medium truncate;
}

.session-preview {
  @apply text-sm text-gray-400 truncate mt-1;
}

.session-item.active .session-preview {
  @apply text-blue-100;
}

.session-time {
  @apply text-xs text-gray-500 mt-1;
}

.session-item.active .session-time {
  @apply text-blue-200;
}

.session-actions {
  @apply flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.action-btn {
  @apply p-1 hover:bg-gray-600 rounded transition-colors;
}

/* 右侧聊天区域 */
.chat-area {
  @apply flex-1 flex flex-col;
}

.welcome-screen {
  @apply flex-1 flex items-center justify-center;
}

.welcome-content {
  @apply text-center;
}

.welcome-icon {
  @apply mb-6;
}

.welcome-title {
  @apply text-3xl font-bold mb-2;
}

.welcome-subtitle {
  @apply text-gray-400 mb-8;
}

.welcome-btn {
  @apply px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors;
}

.chat-content {
  @apply flex-1 flex flex-col;
}

.chat-header {
  @apply flex items-center justify-between p-4 border-b border-gray-700;
}

.chat-title h3 {
  @apply text-lg font-semibold;
}

.message-count {
  @apply text-sm text-gray-400;
}

.header-btn {
  @apply p-2 hover:bg-gray-700 rounded-lg transition-colors;
}

.messages-container {
  @apply flex-1 overflow-y-auto p-4;
}

.loading-messages {
  @apply p-4;
}

.messages-list {
  @apply space-y-4;
}

.message {
  @apply flex gap-3;
}

.user-message {
  @apply flex-row-reverse;
}

.message-avatar {
  @apply w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0;
}

.user-message .message-avatar {
  @apply bg-blue-600;
}

.message-content {
  @apply flex-1 min-w-0;
}

.user-message .message-content {
  @apply text-right;
}

.message-text {
  @apply bg-gray-700 rounded-lg px-4 py-2 inline-block max-w-full;
}

.user-message .message-text {
  @apply bg-blue-600;
}

.message-meta {
  @apply text-xs text-gray-400 mt-1 space-x-2;
}

.tool-calls {
  @apply mt-2 p-3 bg-gray-800 rounded-lg;
}

.tool-calls-header {
  @apply text-sm font-medium text-gray-300 mb-2;
}

.tool-call {
  @apply mb-2 last:mb-0;
}

.tool-name {
  @apply text-xs text-blue-400 font-mono;
}

.tool-result {
  @apply text-xs text-gray-300 font-mono bg-gray-900 p-2 rounded mt-1 overflow-x-auto;
}

.typing-indicator .message-content {
  @apply bg-gray-700 rounded-lg px-4 py-2;
}

.typing-dots {
  @apply flex gap-1;
}

.typing-dots span {
  @apply w-2 h-2 bg-gray-400 rounded-full animate-bounce;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.1s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.2s;
}

.input-area {
  @apply p-4 border-t border-gray-700;
}

.input-container {
  @apply flex gap-3 items-end;
}

.message-input {
  @apply flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 resize-none focus:outline-none focus:border-blue-500 transition-colors;
}

.send-btn {
  @apply p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
}

/* 模态框 */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4;
}

.modal-title {
  @apply text-lg font-semibold mb-4;
}

.modal-input {
  @apply w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors mb-4;
}

.modal-actions {
  @apply flex gap-3 justify-end;
}

.modal-btn-cancel {
  @apply px-4 py-2 text-gray-400 hover:text-white transition-colors;
}

.modal-btn-confirm {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors;
}
</style>