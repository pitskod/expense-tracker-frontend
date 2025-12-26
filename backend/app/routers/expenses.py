from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

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
    db_expense = Expense(**expense.model_dump(), user_id=user_id)
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense


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
    expenses = session.exec(select(Expense).where(Expense.user_id == user_id)).all()
    return expenses
