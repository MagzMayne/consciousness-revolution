"""
haven_agent_finance - Python SDK for the Agentic Finance system.

Uses only stdlib (urllib) so there are no required install-time dependencies
for basic usage.  The optional `requests` extra is listed in setup.py for
teams that prefer it, but this module does not import it.
"""

import json
import urllib.request
import urllib.error


class AgentFinanceClient:
    """Client for the Agentic Finance HTTP API gateway.

    Example::

        client = AgentFinanceClient(
            base_url="http://localhost:3000",
            api_key="my-api-key",
        )
        result = client.simulate(
            agent_id="agent-1",
            intent_type="trade.swap",
            parameters={"fromAsset": "ETH", "toAsset": "USDC", "amount": "0.1"},
        )
    """

    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _headers(self) -> dict:
        h = {"Content-Type": "application/json"}
        if self.api_key:
            h["x-api-key"] = self.api_key
        return h

    def _post(self, path: str, payload: dict) -> dict:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=self._headers(),
            method="POST",
        )
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"AgentFinanceClient: HTTP {exc.code} from POST {path} — {body}"
            ) from exc

    def _get(self, path: str) -> dict:
        req = urllib.request.Request(
            f"{self.base_url}{path}",
            headers=self._headers(),
            method="GET",
        )
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"AgentFinanceClient: HTTP {exc.code} from GET {path} — {body}"
            ) from exc

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def intent(
        self,
        agent_id: str,
        intent_type: str,
        parameters: dict,
        context: dict = None,
        mode: str = "simulate_and_execute",
    ) -> dict:
        """Submit an intent to the API gateway.

        Args:
            agent_id:   Identifier of the submitting agent.
            intent_type: One of the declared intent type strings.
            parameters: Intent-specific parameters.
            context:    Optional context metadata.
            mode:       ``"simulate"`` or ``"simulate_and_execute"``.

        Returns:
            Parsed JSON response from the gateway.
        """
        return self._post(
            "/v1/intent",
            {
                "agent_id": agent_id,
                "intent_type": intent_type,
                "parameters": parameters,
                "context": context or {},
                "mode": mode,
            },
        )

    def simulate(
        self,
        agent_id: str,
        intent_type: str,
        parameters: dict,
        context: dict = None,
    ) -> dict:
        """Simulate an intent (read-only, never executes on-chain).

        Args:
            agent_id:    Identifier of the submitting agent.
            intent_type: One of the declared intent type strings.
            parameters:  Intent-specific parameters.
            context:     Optional context metadata.

        Returns:
            Parsed JSON simulation result from the gateway.
        """
        return self.intent(
            agent_id=agent_id,
            intent_type=intent_type,
            parameters=parameters,
            context=context,
            mode="simulate",
        )

    def get_lineage(self, lineage_id: str) -> dict:
        """Retrieve a lineage record by ID.

        Args:
            lineage_id: The lineage record identifier.

        Returns:
            Parsed JSON lineage record from the gateway.
        """
        return self._get(f"/v1/lineage/{lineage_id}")
