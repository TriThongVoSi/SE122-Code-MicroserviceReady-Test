import { z } from "zod";

export const MARKETPLACE_API_PREFIX = "/api/v1/marketplace";

export type MarketplaceApiResponse<T> = {
  code: string;
  message: string;
  result: T;
  status?: number;
};

export type MarketplacePage<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const MarketplaceEnvelopeSchema = z.object({
  code: z.string(),
  message: z.string(),
  result: z.unknown(),
  status: z.number().optional(),
});

export class MarketplaceApiClientError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code = "ERR_MARKETPLACE_CLIENT", status?: number) {
    super(message);
    this.name = "MarketplaceApiClientError";
    this.code = code;
    this.status = status;
  }
}

export function parseMarketplaceEnvelope<T>(
  payload: unknown,
): MarketplaceApiResponse<T> {
  const parsed = MarketplaceEnvelopeSchema.parse(payload);
  return parsed as MarketplaceApiResponse<T>;
}

export function okMarketplaceResponse<T>(
  result: T,
  message = "OK",
  code = "SUCCESS",
): MarketplaceApiResponse<T> {
  return {
    code,
    message,
    result,
  };
}

export function toMarketplaceClientError(error: unknown): MarketplaceApiClientError {
  if (error instanceof MarketplaceApiClientError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: string;
      response?: {
        status?: number;
        data?: {
          code?: string;
          message?: string;
        };
      };
    };

    const status = maybeError.response?.status;
    const code = maybeError.response?.data?.code ?? "ERR_MARKETPLACE_CLIENT";
    const message =
      maybeError.response?.data?.message ??
      maybeError.message ??
      "Marketplace API request failed.";

    return new MarketplaceApiClientError(message, code, status);
  }

  return new MarketplaceApiClientError("Marketplace API request failed.");
}
