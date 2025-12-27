from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import nulls_last
from sqlmodel import Session, select, func

from app.models.expense import Expense, ExpenseCreateRequest, ExpenseResponse, ExpenseUpdateRequest
from app.models.users import User
from app.utils.db import get_session

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]

def _get_current_user_id(request: Request, session: Session) -> int:
    user_email = getattr(request.state, "user_email", None)
    if not user_email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user: User | None = session.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user.id


@router.post("/", response_model=ExpenseResponse)
async def create_expense(request: Request, expense: ExpenseCreateRequest, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    # Get the maximum display_order for this user, or default to 0
    max_order_result = session.exec(
        select(func.max(Expense.display_order)).where(Expense.user_id == user_id)
    ).first()
    next_order = (max_order_result or 0) + 1 if max_order_result is not None else 1
    db_expense = Expense(**expense.model_dump(), user_id=user_id, display_order=next_order)
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense


class ReorderRequest(BaseModel):
    expense_ids: list[int]


@router.patch("/reorder", response_model=dict)
async def reorder_expenses(request: Request, reorder_data: ReorderRequest, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    
    # Verify all expenses belong to the user
    expenses = session.exec(
        select(Expense).where(Expense.id.in_(reorder_data.expense_ids), Expense.user_id == user_id)
    ).all()
    
    if len(expenses) != len(reorder_data.expense_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some expenses not found or do not belong to the user"
        )
    
    # Update display_order for each expense based on the new order
    expense_dict = {exp.id: exp for exp in expenses}
    for index, expense_id in enumerate(reorder_data.expense_ids, start=1):
        expense = expense_dict[expense_id]
        expense.display_order = index
    
    session.commit()
    return {"detail": "Expenses reordered successfully"}


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(request: Request, expense_id: int, expense: ExpenseUpdateRequest, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    db_expense = session.get(Expense, expense_id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if db_expense.user_id != user_id:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_expense, k, v)

    session.commit()
    session.refresh(db_expense)
    return db_expense


@router.get("/{id}", response_model=ExpenseResponse)
def get_expense(request: Request, id: int, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    db_expense = session.get(Expense, id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if db_expense.user_id != user_id:
        raise HTTPException(status_code=404, detail="Expense not found")

    return db_expense


@router.delete("/{id}")
def delete_expense(request: Request, id: int, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    db_expense = session.get(Expense, id)

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if db_expense.user_id != user_id:
        raise HTTPException(status_code=404, detail="Expense not found")

    session.delete(db_expense)
    session.commit()
    return {"detail": "Expense deleted"}
    raise HTTPException(status_code=404, detail="Expense not found")


@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(request: Request, session: SessionDep):
    user_id = _get_current_user_id(request, session)
    # Sort by display_order (nulls last), then by id as fallback
    expenses = session.exec(
        select(Expense)
        .where(Expense.user_id == user_id)
        .order_by(nulls_last(Expense.display_order.asc()), Expense.id.asc())
    ).all()
    return expenses
