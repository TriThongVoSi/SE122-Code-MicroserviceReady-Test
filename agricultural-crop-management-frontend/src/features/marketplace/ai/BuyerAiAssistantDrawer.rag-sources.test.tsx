import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuyerAiAssistantDrawer } from './BuyerAiAssistantDrawer';

const aiMock = vi.hoisted(() => ({
  messages: [] as any[],
  sendMessage: vi.fn(),
  reset: vi.fn(),
}));

vi.mock('@/features/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/ai')>()),
  useBuyerAiChatSession: () => ({
    messages: aiMock.messages,
    isSending: false,
    sendMessage: aiMock.sendMessage,
    reset: aiMock.reset,
  }),
}));

describe('BuyerAiAssistantDrawer RAG sources', () => {
  beforeEach(() => {
    aiMock.messages = [
      {
        id: 'assistant-1',
        role: 'assistant',
        content: 'Nen kiem tra truy xuat truoc khi mua.',
        createdAt: '2026-06-23T00:00:00.000Z',
        sources: [
          {
            file_name: 'faq-nguoi-mua.md',
            heading: 'Truy xuat',
            page: 1,
            snippet: 'Quet ma QR de xem nguon goc.',
          },
        ],
      },
    ];
    aiMock.sendMessage.mockReset();
    aiMock.reset.mockReset();
  });

  it('renders clean source details under assistant answers', () => {
    render(
      <MemoryRouter>
        <BuyerAiAssistantDrawer
          open
          onOpenChange={vi.fn()}
          requestId={1}
          buyerContext="black beans"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Nguồn tham khảo')).toBeInTheDocument();
    expect(screen.getByText('Truy xuat')).toBeInTheDocument();
    expect(screen.getByText('faq-nguoi-mua.md')).toBeInTheDocument();
    expect(screen.getByText('Trang 1')).toBeInTheDocument();
    expect(screen.getByText('Quet ma QR de xem nguon goc.')).toBeInTheDocument();
  });

  it('renders product item cards and closes the drawer on card click', () => {
    aiMock.messages = [
      {
        id: 'assistant-2',
        role: 'assistant',
        content: 'Tôi tìm thấy sản phẩm phù hợp.',
        createdAt: '2026-06-23T00:00:00.000Z',
        sources: [],
        items: [
          {
            id: 1,
            name: 'Gạo thơm ST25',
            price: 35000,
            unit: 'kg',
            status: 'ACTIVE',
            imageUrl: '/rice.jpg',
            farmName: 'Nông trại A',
            url: '/products/1',
          },
        ],
      },
    ];
    const onOpenChange = vi.fn();

    render(
      <MemoryRouter>
        <BuyerAiAssistantDrawer
          open
          onOpenChange={onOpenChange}
          requestId={1}
          buyerContext="rice"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Gạo thơm ST25')).toBeInTheDocument();
    expect(screen.getByText('Nông trại A')).toBeInTheDocument();
    expect(screen.getByText('Đang bán')).toBeInTheDocument();
    expect(screen.getByText(/35.000/)).toBeInTheDocument();
    expect(screen.queryByText(/Đã bán/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Gạo thơm ST25/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
