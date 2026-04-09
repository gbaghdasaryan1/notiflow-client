import { useRef, useState, type KeyboardEvent } from 'react';
import { useChatStore } from '../../store/chat-store';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/ui/Toast';
import styles from './MessageInput.module.scss';

const MAX_CHARS = 1000;
const WARN_THRESHOLD = 900;

export const MessageInput = () => {
  const activeId = useChatStore((s) => s.activeId);
  const conversations = useChatStore((s) => s.conversations);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const activeConv = conversations.find((c) => c._id === activeId) ?? null;

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast, show, dismiss } = useToast();

  const trimmed = text.trimEnd();
  const canSend = Boolean(trimmed) && !sending && !!activeConv;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * 5 + 16; // 5 rows + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
      autoResize();
    }
  };

  const handleSend = async () => {
    if (!canSend || !activeConv) return;
    setSending(true);
    try {
      await sendMessage(activeConv, trimmed);
      setText('');
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.focus();
        }
      });
    } catch {
      show('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!activeConv) return null;

  return (
    <>
      <Toast toast={toast} onDismiss={dismiss} />
      <div className={styles.root}>
        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
            disabled={sending}
          />
          {text.length > WARN_THRESHOLD && (
            <span
              className={`${styles.charCount} ${text.length >= MAX_CHARS ? styles.charCountMax : ''}`}
            >
              {MAX_CHARS - text.length}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.sendBtn}
          onClick={() => void handleSend()}
          disabled={!canSend}
          aria-label="Send message"
        >
          {sending ? (
            <span className={styles.spinner} />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M14 8L2 2l3 6-3 6 12-6z"
                fill="currentColor"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};
