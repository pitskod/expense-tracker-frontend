from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class ExpenseBase(SQLModel):
    name: str
    amount: float = Field(gt=0)
    currency: str
    category: str
    date: Optional[datetime]


class Expense(ExpenseBase, table=True):
    __tablename__ = "expenses"
    id: int = Field(primary_key=True, index=True)


class ExpenseCreateRequest(ExpenseBase):
    pass


class ExpenseUpdateRequest(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
