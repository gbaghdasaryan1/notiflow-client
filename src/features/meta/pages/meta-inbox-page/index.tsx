import { useState } from 'react';
import { InboxLayout } from '../../components/InboxLayout';
import { ConversationList } from '../../components/ConversationList';
import { ChatView } from '../../components/ChatView';
import { MessageInput } from '../../components/MessageInput';
import { useChatStore } from '../../store/chat-store';
import { useMetaSocket } from '../../use-socket';
import styles from './MetaInbox.module.scss';

export const MetaInboxPage = () => {
  useMetaSocket();

  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);

  // On mobile: show list when no active conv, show chat when active
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelectConversation = (id: string) => {
    setActive(id);
    setMobileView('chat');
  };

  const handleBack = () => {
    setActive(null);
    setMobileView('list');
  };

  return (
    <InboxLayout>
      <div className={styles.root}>
        {/* Conversation list — hidden on mobile when chat is open */}
        <div
          className={`${styles.listPanel} ${mobileView === 'chat' ? styles.hiddenMobile : ''}`}
        >
          <ConversationList onSelect={handleSelectConversation} />
        </div>

        {/* Chat panel */}
        <div
          className={`${styles.chatPanel} ${mobileView === 'list' && !activeId ? styles.hiddenMobile : ''}`}
        >
          {/* Mobile back button */}
          {activeId && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleBack}
              aria-label="Back to conversations"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <ChatView />
          <MessageInput />
        </div>
      </div>
    </InboxLayout>
  );
};
