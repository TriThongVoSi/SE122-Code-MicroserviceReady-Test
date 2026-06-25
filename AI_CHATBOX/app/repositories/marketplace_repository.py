import logging
from typing import Any

import requests

from app.config import settings

logger = logging.getLogger(__name__)


class MarketplaceRepository:
    def __init__(
        self,
        analytics_url: str | None = None,
        api_token: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.analytics_url = (
            settings.ACM_MARKETPLACE_ANALYTICS_URL
            if analytics_url is None
            else analytics_url
        ).strip()
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

        try:
            response = requests.get(
                self.analytics_url,
                params=params,
                headers=headers,
                timeout=self.timeout_seconds,
            )
            if response.status_code in (204, 404):
                return None
            response.raise_for_status()
            payload = response.json()
        except (requests.RequestException, ValueError, TypeError) as exc:
            logger.warning("[MARKETPLACE] analytics request failed: %s", exc)
            return None

        if isinstance(payload, dict) and "data" in payload:
            payload = payload.get("data")
        if not isinstance(payload, dict) or not payload:
            return None
        return payload
