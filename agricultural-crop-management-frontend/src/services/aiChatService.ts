export type AiChatSource = {
  file_name: string;
  heading: string;
  page?: number;
  snippet?: string;
};

export type AiChatItem = {
  type?: string;
  id?: number | string;
  name?: string;
  category?: string;
  price?: number;
  unit?: string;
  status?: string;
  imageUrl?: string;
  farmId?: number | string;
  farmName?: string;
  soldCount?: number;
  rating?: number;
  url?: string;
};

export type AiChatRequest = {
  message: string;
  top_k: number;
};

export type AiChatResponse = {
  answer: string;
  sources: AiChatSource[];
  items: AiChatItem[];
  intent?: string;
  metadata?: {
    type?: 'marketplace_product' | 'marketplace_farm';
    product?: {
      id: number | string;
      name: string;
      price?: number;
      unit?: string;
      farmName?: string;
      rating?: number;
      soldQuantity?: number;
      imageUrl?: string;
      url?: string;
    };
  };
};

export const OFFLINE_AI_SERVICE_MESSAGE =
  'Không thể kết nối AI Chatbox. Vui lòng kiểm tra AI_CHATBOX đã chạy ở port 8000 chưa.';

export const EMPTY_AI_RESPONSE_MESSAGE =
  'AI chưa trả về nội dung phù hợp. Vui lòng thử hỏi lại rõ hơn.';

const AI_CHAT_ENDPOINT = '/ai-api/v1/ai/chat';
const DEFAULT_TOP_K = 4;
export const AI_CHAT_TIMEOUT_MS = 45000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePage(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeSource(value: unknown): AiChatSource | null {
  if (!isRecord(value)) {
    return null;
  }

  const source: AiChatSource = {
    file_name: normalizeString(value.file_name),
    heading: normalizeString(value.heading),
  };
  const page = normalizePage(value.page);
  const snippet = normalizeString(value.snippet);

  if (page !== undefined) {
    source.page = page;
  }
  if (snippet) {
    source.snippet = snippet;
  }

  if (!source.file_name && !source.heading && page === undefined && !snippet) {
    return null;
  }

  return source;
}

function normalizeItem(value: unknown): AiChatItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'number' || typeof value.id === 'string' ? value.id : undefined;
  const name = normalizeString(value.name);
  const item: AiChatItem = {};
  const type = normalizeString(value.type);
  const category = normalizeString(value.category);
  const unit = normalizeString(value.unit);
  const status = normalizeString(value.status);
  const imageUrl = normalizeString(value.imageUrl);
  const farmName = normalizeString(value.farmName);
  const url = normalizeString(value.url);
  const farmId = typeof value.farmId === 'number' || typeof value.farmId === 'string' ? value.farmId : undefined;
  const price = normalizeNumber(value.price);
  const soldCount = normalizeNumber(value.soldCount);
  const rating = normalizeNumber(value.rating);

  if (type) item.type = type;
  if (id !== undefined) item.id = id;
  if (name) item.name = name;
  if (category) item.category = category;
  if (price !== undefined) item.price = price;
  if (unit) item.unit = unit;
  if (status) item.status = status;
  if (imageUrl) item.imageUrl = imageUrl;
  if (farmId !== undefined) item.farmId = farmId;
  if (farmName) item.farmName = farmName;
  if (soldCount !== undefined) item.soldCount = soldCount;
  if (rating !== undefined) item.rating = rating;
  if (url) item.url = url;

  if (!item.id && !item.name && !item.url) {
    return null;
  }

  return item;
}

function normalizeMetadata(value: unknown): AiChatResponse['metadata'] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const type = typeof value.type === 'string' ? value.type : undefined;
  if (type !== 'marketplace_product' && type !== 'marketplace_farm') {
    return undefined;
  }
  const productVal = value.product;
  if (!isRecord(productVal)) {
    return { type };
  }
  const idVal = productVal.id;
  const id = typeof idVal === 'number' || typeof idVal === 'string' ? idVal : undefined;
  const name = typeof productVal.name === 'string' ? productVal.name : '';
  const price = typeof productVal.price === 'number' ? productVal.price : undefined;
  const unit = typeof productVal.unit === 'string' ? productVal.unit : undefined;
  const farmName = typeof productVal.farmName === 'string' ? productVal.farmName : undefined;
  const rating = typeof productVal.rating === 'number' ? productVal.rating : undefined;
  const soldQuantity = normalizeNumber(productVal.soldQuantity);
  const imageUrl = typeof productVal.imageUrl === 'string' ? productVal.imageUrl : undefined;
  const url = typeof productVal.url === 'string' ? productVal.url : undefined;

  return {
    type,
    product: {
      id: id ?? '',
      name,
      price,
      unit,
      farmName,
      rating,
      soldQuantity,
      imageUrl,
      url,
    },
  };
}

function normalizeResponse(payload: unknown): AiChatResponse {
  if (!isRecord(payload)) {
    return {
      answer: EMPTY_AI_RESPONSE_MESSAGE,
      sources: [],
      items: [],
    };
  }

  const answer = normalizeString(payload.answer) || EMPTY_AI_RESPONSE_MESSAGE;
  const rawSources = Array.isArray(payload.sources) ? payload.sources : [];
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const metadata = normalizeMetadata(payload.metadata);
  const intent = normalizeString(payload.intent);

  return {
    answer,
    sources: rawSources
      .map(normalizeSource)
      .filter((source): source is AiChatSource => source !== null),
    items: rawItems
      .map(normalizeItem)
      .filter((item): item is AiChatItem => item !== null),
    ...(intent ? { intent } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export async function sendAiChatMessage(
  message: string,
  topK: number = DEFAULT_TOP_K,
): Promise<AiChatResponse> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return {
      answer: EMPTY_AI_RESPONSE_MESSAGE,
      sources: [],
      items: [],
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AI_CHAT_TIMEOUT_MS);
  const request: AiChatRequest = {
    message: trimmedMessage,
    top_k: topK,
  };

  try {
    const response = await fetch(AI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(OFFLINE_AI_SERVICE_MESSAGE);
    }

    const payload = await response.json().catch(() => null);
    return normalizeResponse(payload);
  } catch {
    throw new Error(OFFLINE_AI_SERVICE_MESSAGE);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
