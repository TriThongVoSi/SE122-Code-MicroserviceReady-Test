import { useCallback, useState } from 'react';
import { sendAiChatMessage, type AiChatItem, type AiChatSource } from '@/services/aiChatService';
import type { AiChatMessage, AiChatRole } from './useAiChatSession';

type BuyerAiChatSessionOptions = {
    welcomeMessage?: string;
    fallbackMessage?: string;
};

const DEFAULT_WELCOME_MESSAGE =
    'Xin chào! Tôi là trợ lý mua nông sản. Tôi có thể giúp bạn kiểm tra chất lượng, giá, truy xuất nguồn gốc, vận chuyển và điều kiện đổi trả.';

const DEFAULT_FALLBACK_MESSAGE =
    'Hiện tại tôi chưa thể trả lời. Vui lòng thử lại hoặc đặt câu hỏi khác liên quan đến việc chọn mua nông sản.';

const createMessage = (
    role: AiChatRole,
    content: string,
    sources?: AiChatSource[],
    metadata?: AiChatMessage['metadata'],
    items?: AiChatItem[],
    intent?: string,
): AiChatMessage => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(sources?.length ? { sources } : {}),
    ...(items?.length ? { items } : {}),
    ...(intent ? { intent } : {}),
    ...(metadata ? { metadata } : {}),
});

function buildContextualMessage(userMessage: string, buyerContext?: string | null) {
    const trimmedContext = buyerContext?.trim();

    if (!trimmedContext) {
        return userMessage;
    }

    return [
        'Boi canh san pham/nguoi mua:',
        trimmedContext,
        '',
        'Cau hoi:',
        userMessage,
    ].join('\n');
}

let cachedMessages: AiChatMessage[] | null = null;

export function clearBuyerAiChatSessionCache() {
    cachedMessages = null;
}

export function useBuyerAiChatSession(options: BuyerAiChatSessionOptions = {}) {
    const welcomeMessage = options.welcomeMessage ?? DEFAULT_WELCOME_MESSAGE;
    const fallbackMessage = options.fallbackMessage ?? DEFAULT_FALLBACK_MESSAGE;

    const [messages, setMessages] = useState<AiChatMessage[]>(() => {
        if (cachedMessages !== null) {
            return cachedMessages;
        }
        return [createMessage('assistant', welcomeMessage)];
    });
    const [isSending, setIsSending] = useState(false);

    const reset = useCallback(() => {
        const initial = [createMessage('assistant', welcomeMessage)];
        cachedMessages = initial;
        setMessages(initial);
    }, [welcomeMessage]);

    const sendMessage = useCallback(async (userMessage: string, buyerContext?: string | null) => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage || isSending) {
            return null;
        }

        const userMsg = createMessage('user', trimmedMessage);
        setMessages((prev) => {
            const next = [...prev, userMsg];
            cachedMessages = next;
            return next;
        });
        setIsSending(true);

        try {
            const response = await sendAiChatMessage(buildContextualMessage(trimmedMessage, buyerContext));
            const assistantText = response.answer?.trim() || fallbackMessage;
            const assistantMessage = createMessage(
                'assistant',
                assistantText,
                response.sources,
                response.metadata,
                response.items,
                response.intent,
            );
            setMessages((prev) => {
                const next = [...prev, assistantMessage];
                cachedMessages = next;
                return next;
            });
            return assistantMessage;
        } catch {
            const assistantMessage = createMessage('assistant', fallbackMessage);
            setMessages((prev) => {
                const next = [...prev, assistantMessage];
                cachedMessages = next;
                return next;
            });
            return assistantMessage;
        } finally {
            setIsSending(false);
        }
    }, [fallbackMessage, isSending]);

    return {
        messages,
        isSending,
        sendMessage,
        reset,
    };
}
