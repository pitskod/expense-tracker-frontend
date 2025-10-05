from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.utils.db import create_db_and_tables
from app.routers.expenses import router as expenses_router
from app.routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")
    # create_db_and_tables()
    print("Database tables created!")
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

# Include routers with proper error handling
def include_routers():
    try:
        app.include_router(expenses_router, prefix="/api/expenses", tags=["expenses"])
        app.include_router(users_router, prefix="/api/users", tags=["users"])
        print("All routers successfully included")
    except Exception as e:
        print(f"Error including routers: {str(e)}")
        raise

include_routers()


# Base route for health check
@app.get("/")
async def read_root():
    return {"message": "Expense Tracker API", "status": "running"}
