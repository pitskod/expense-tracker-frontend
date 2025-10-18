from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from routers.expenses import router as expenses_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from utils.db import create_db_and_tables
from utils.middleware import AuthMiddleware

def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

    
app = FastAPI(lifespan=lifespan)

# Register authentication middleware to protect specific routes
# Note: tuples with a single item require a trailing comma.
app.add_middleware(
    AuthMiddleware,
    protected_prefixes=("/users", "/expenses"),
    exclude_prefixes=("/auth", "/docs", "/openapi.json", "/redoc"),
)

app.include_router(expenses_router, prefix="/expenses", tags=["expenses"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])


# Customize OpenAPI to include Bearer auth so Swagger UI shows the Authorize button
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Expense Tracker API",
        version="1.0.0",
        description="API documentation with JWT Bearer authentication",
        routes=app.routes,
    )

    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    # Mark protected paths to require Bearer auth in docs (so Swagger sends the header)
    for path, methods in openapi_schema.get("paths", {}).items():
        if path.startswith("/users") or path.startswith("/expenses"):
            for method_obj in methods.values():
                method_obj.setdefault("security", []).append({"BearerAuth": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi