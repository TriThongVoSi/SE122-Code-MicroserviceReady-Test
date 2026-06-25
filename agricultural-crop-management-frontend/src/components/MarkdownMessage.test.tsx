import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownMessage } from './MarkdownMessage';

describe('MarkdownMessage', () => {
  it('renders bold text correctly', () => {
    render(<MarkdownMessage content="Đây là **văn bản đậm**" />);
    const boldEl = screen.getByText('văn bản đậm');
    expect(boldEl.tagName).toBe('STRONG');
  });

  it('renders lists correctly with default variant', () => {
    const markdownContent = `
1. Mục thứ nhất
2. Mục thứ hai
    `;
    render(<MarkdownMessage content={markdownContent} />);
    const item1 = screen.getByText('Mục thứ nhất');
    const item2 = screen.getByText('Mục thứ hai');
    expect(item1.tagName).toBe('LI');
    expect(item2.tagName).toBe('LI');
  });

  it('preprocesses inline list items and splits them into distinct items when variant is buyer', () => {
    // This inline format normally parses as a single paragraph. 
    // In buyer variant, it should be preprocessed and split.
    const markdownContent = 'Đầu tiên. 1. Chọn nơi giao hàng chất lượng. 2. Kiểm tra độ chín lúc nhận hàng.';
    render(<MarkdownMessage content={markdownContent} variant="buyer" />);
    
    // Check that we render list items (LI)
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Chọn nơi giao hàng chất lượng.');
    expect(items[1]).toHaveTextContent('Kiểm tra độ chín lúc nhận hàng.');
  });

  it('ensures headers have spacing before them in buyer variant', () => {
    const markdownContent = 'Dòng chữ trước\n### Tiêu đề phụ';
    render(<MarkdownMessage content={markdownContent} variant="buyer" />);
    // Check that the heading H3 is rendered
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Tiêu đề phụ');
  });
});
