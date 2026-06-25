import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendAiChatMessage } from '@/services/aiChatService';
import { useBuyerAiChatSession, clearBuyerAiChatSessionCache } from './useBuyerAiChatSession';

vi.mock('@/services/aiChatService', () => ({
    sendAiChatMessage: vi.fn(),
}));

const sendAiChatMessageMock = vi.mocked(sendAiChatMessage);

describe('useBuyerAiChatSession', () => {
    beforeEach(() => {
        sendAiChatMessageMock.mockReset();
        clearBuyerAiChatSessionCache();
    });

    it('stores user and assistant messages when buyer chat succeeds', async () => {
        sendAiChatMessageMock.mockResolvedValue({
            answer: 'Check traceability first.',
            sources: [{ file_name: 'buyer.md', heading: 'Traceability', page: 2 }],
        });

        const { result } = renderHook(() =>
            useBuyerAiChatSession({ welcomeMessage: 'Welcome buyer' }),
        );

        await act(async () => {
            await result.current.sendMessage('  Should I buy this lot?  ', ' black beans ');
        });

        expect(sendAiChatMessageMock).toHaveBeenCalledWith(expect.stringContaining('black beans'));
        expect(sendAiChatMessageMock).toHaveBeenCalledWith(expect.stringContaining('Should I buy this lot?'));

        await waitFor(() => {
            expect(result.current.messages).toHaveLength(3);
        });
        expect(result.current.messages.map((message) => message.content)).toEqual([
            'Welcome buyer',
            'Should I buy this lot?',
            'Check traceability first.',
        ]);
        expect(result.current.messages[2].sources).toEqual([
            { file_name: 'buyer.md', heading: 'Traceability', page: 2 },
        ]);
    });

    it('stores product metadata when API response contains it', async () => {
        sendAiChatMessageMock.mockResolvedValue({
            answer: 'Sản phẩm mắc nhất hiện tại là Gạo thơm ST25 An Phú.',
            sources: [],
            metadata: {
                type: 'marketplace_product',
                product: {
                    id: 12,
                    name: 'Gạo thơm ST25 An Phú',
                    price: 138000,
                    unit: 'kg',
                    farmName: 'Nông trại An Phú',
                    rating: 4.9,
                    soldQuantity: 120,
                    imageUrl: '/demo-evidence/products/rice.jpg',
                },
            },
        });

        const { result } = renderHook(() =>
            useBuyerAiChatSession({ welcomeMessage: 'Welcome buyer' }),
        );

        await act(async () => {
            await result.current.sendMessage('Sản phẩm nào mắc nhất trên sàn?');
        });

        await waitFor(() => {
            expect(result.current.messages).toHaveLength(3);
        });

        const assistantMessage = result.current.messages[2];
        expect(assistantMessage.metadata).toEqual({
            type: 'marketplace_product',
            product: {
                id: 12,
                name: 'Gạo thơm ST25 An Phú',
                price: 138000,
                unit: 'kg',
                farmName: 'Nông trại An Phú',
                rating: 4.9,
                soldQuantity: 120,
                imageUrl: '/demo-evidence/products/rice.jpg',
            },
        });
    });

    it('adds the configured fallback message when buyer chat fails', async () => {
        sendAiChatMessageMock.mockRejectedValue(new Error('network'));

        const { result } = renderHook(() =>
            useBuyerAiChatSession({
                welcomeMessage: 'Welcome buyer',
                fallbackMessage: 'Try again later.',
            }),
        );

        await act(async () => {
            await result.current.sendMessage('Should I buy this lot?', 'black beans');
        });

        await waitFor(() => {
            expect(result.current.messages[result.current.messages.length - 1]?.content).toBe('Try again later.');
        });
    });
});
