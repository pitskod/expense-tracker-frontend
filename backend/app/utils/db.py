from sqlmodel import Session, SQLModel, create_engine

from app.config.config import app_config
# Import models to register them with SQLModel
from app.models.users import User
from app.models.expense import Expense
from app.models.refresh_tokens import RefreshToken

engine = create_engine(app_config.database.database_url, echo=True)  # echo=True для отладки SQL запросов


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
