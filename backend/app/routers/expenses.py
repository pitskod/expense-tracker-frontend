from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.models.expense import Expense, ExpenseCreateRequest, ExpenseResponse, ExpenseUpdateRequest
from app.utils.db import get_session

router = APIRouter(tags=["expenses"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreateRequest, session: SessionDep):
    db_expense = Expense(**expense.model_dump())
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense: ExpenseUpdateRequest, session: SessionDep):
    db_expense = session.get(Expense, expense_id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_expense, k, v)

    session.commit()
    session.refresh(db_expense)
    return db_expense


@router.get("/{id}", response_model=ExpenseResponse)
def get_expense(id: int, session: SessionDep):
    db_expense = session.get(Expense, id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return db_expense


@router.delete("/{id}")
def delete_expense(id: int, session: SessionDep):
    db_expense = session.get(Expense, id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    session.delete(db_expense)
    session.commit()
    return {"detail": "Expense deleted"}
    raise HTTPException(status_code=404, detail="Expense not found")


@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(session: SessionDep):
    expenses = session.exec(select(Expense)).all()
    return expenses
