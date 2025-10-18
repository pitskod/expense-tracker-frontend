from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers.expenses import router as expenses_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from utils.db import create_db_and_tables

def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

    
app = FastAPI()

app.include_router(expenses_router, prefix="/expenses", tags=["expenses"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])