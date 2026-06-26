import logging
from typing import Any

import requests

from app.config import settings

logger = logging.getLogger(__name__)


class MarketplaceRepository:
    def __init__(
        self,
        base_url: str | None = None,
        analytics_url: str | None = None,
        api_token: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.base_url = (
            settings.ACM_MARKETPLACE_BASE_URL if base_url is None else base_url
        ).strip().rstrip("/")
        self.analytics_url = (
            settings.ACM_MARKETPLACE_ANALYTICS_URL
            if analytics_url is None
            else analytics_url
        ).strip() or f"{self.base_url}/api/marketplace/analytics/query"
        self.api_token = (
            settings.ACM_MARKETPLACE_API_TOKEN if api_token is None else api_token
        ).strip()
        self.timeout_seconds = (
            settings.ACM_MARKETPLACE_TIMEOUT_SECONDS
            if timeout_seconds is None
            else timeout_seconds
        )

    def get_most_expensive_product(self, product_keyword: str | None):
        return self._fetch("most_expensive_product", product_keyword)

    def get_cheapest_product(self, product_keyword: str | None):
        return self._fetch("cheapest_product", product_keyword)

    def get_best_selling_product(self, product_keyword: str | None):
        return self._fetch("best_selling_product", product_keyword)

    def get_top_farm_by_orders(self):
        return self._fetch("top_farm_by_orders", None)

    def get_top_farm_by_five_star_reviews(self):
        return self._fetch("top_farm_by_five_star_reviews", None)

    def get_top_rated_product(self, product_keyword: str | None):
        return self._fetch("top_rated_product", product_keyword)

    def search_products(self, keyword: str | None = None, status: str = "ACTIVE", limit: int = 5):
        params: dict[str, str | int] = {"limit": limit}
        if keyword:
            params["keyword"] = keyword
        if status:
            params["status"] = status
        return self._fetch_list("/api/marketplace/products/search", params)

    def list_products(
        self,
        status: str | None = None,
        keyword: str | None = None,
        farm_id: int | None = None,
        limit: int = 8,
    ):
        params: dict[str, str | int] = {"limit": limit}
        if status:
            params["status"] = status
        if keyword:
            params["keyword"] = keyword
        if farm_id is not None:
            params["farmId"] = farm_id
        return self._fetch_list("/api/marketplace/products", params)

    def list_farms(self, limit: int = 8):
        return self._fetch_list("/api/marketplace/farms", {"limit": limit})

    def list_farm_products(self, farm_id: int, limit: int = 5):
        return self._fetch_list(f"/api/marketplace/farms/{farm_id}/products", {"limit": limit})

    def query_analytics(self, intent: str, keyword: str | None = None, limit: int = 3):
        params: dict[str, str | int] = {"intent": intent, "limit": limit}
        if keyword:
            params["keyword"] = keyword
        payload = self._request_json(f"{self.base_url}/api/marketplace/analytics/query", params)
        if isinstance(payload, dict):
            raw_items = payload.get("items")
            if isinstance(raw_items, list):
                logger.info("[MARKETPLACE] items=%d", len(raw_items))
        return payload if isinstance(payload, dict) else None

    def _fetch(self, intent: str, product_keyword: str | None) -> dict[str, Any] | None:
        if not self.analytics_url:
            logger.info("[MARKETPLACE] analytics URL is not configured")
            return None

        params = {"intent": intent}
        if product_keyword:
            params["product_keyword"] = product_keyword
        headers = (
            {"Authorization": f"Bearer {self.api_token}"}
            if self.api_token
            else None
        )

        payload = self._request_json(self.analytics_url, params)
        if payload is None:
            return None

        if isinstance(payload, dict) and "data" in payload:
            payload = payload.get("data")
        if not isinstance(payload, dict) or not payload:
            return None
        return payload

    def _fetch_list(self, path: str, params: dict[str, str | int]) -> list[dict[str, Any]]:
        url = f"{self.base_url}{path}"
        logger.info("[MARKETPLACE] GET %s %s", path, " ".join(f"{key}={value}" for key, value in params.items()))
        payload = self._request_json(url, params)
        if not isinstance(payload, list):
            logger.info("[MARKETPLACE] items=0")
            return []
        items = [item for item in payload if isinstance(item, dict)]
        logger.info("[MARKETPLACE] items=%d", len(items))
        return items

    def _request_json(self, url: str, params: dict[str, Any]) -> Any | None:
        headers = (
            {"Authorization": f"Bearer {self.api_token}"}
            if self.api_token
            else None
        )
        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=self.timeout_seconds,
            )
            if response.status_code in (204, 404):
                return None
            if response.status_code >= 400:
                logger.warning("[MARKETPLACE_ERROR] status=%s url=%s", response.status_code, response.url)
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, ValueError, TypeError) as exc:
            logger.warning("[MARKETPLACE_ERROR] url=%s error=%s", url, exc)
            return None
