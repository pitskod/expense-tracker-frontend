import logging
from typing import Callable, Iterable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.auth import verify_token


logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware that validates Bearer access tokens for protected routes.

    - Skips protection for explicitly excluded path prefixes (e.g., /api/auth).
    - Returns 401 Unauthorized when token is missing, invalid, or expired.
    - Logs unauthorized access attempts with remote address and path.
    """

    def __init__(self, app, protected_prefixes: Iterable[str] | None = None, exclude_prefixes: Iterable[str] | None = None):
        super().__init__(app)
        # Consider everything protected under provided prefixes, except excluded ones
        self.protected_prefixes = tuple(protected_prefixes or ("/api/users", "/api/expenses"))
        self.exclude_prefixes = tuple(exclude_prefixes or ("/api/auth", "/docs", "/openapi.json", "/redoc"))

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        path = request.url.path

        # Skip middleware for non-protected paths or explicitly excluded prefixes
        if self._is_excluded(path) or not self._is_protected(path):
            return await call_next(request)

        # Expect Authorization: Bearer <token>
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            logger.warning(
                "Unauthorized access (missing bearer) from %s to %s",
                request.client.host if request.client else "unknown",
                path,
            )
            return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

        token = auth_header.split(" ", 1)[1].strip()
        username = verify_token(token)
        if not username:
            logger.warning(
                "Unauthorized access (invalid/expired token) from %s to %s",
                request.client.host if request.client else "unknown",
                path,
            )
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        # Attach user identity to the request state for downstream handlers if needed
        request.state.user_email = username

        return await call_next(request)

    def _is_excluded(self, path: str) -> bool:
        return any(path.startswith(prefix) for prefix in self.exclude_prefixes)

    def _is_protected(self, path: str) -> bool:
        return any(path.startswith(prefix) for prefix in self.protected_prefixes)
