from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.category import CategoryRead


class TransactionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    amount: float = Field(gt=0)
    kind: str = Field(pattern="^(income|expense)$")
    transaction_date: date
    category_id: int
    notes: str | None = Field(default=None, max_length=1000)


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=160)
    amount: float | None = Field(default=None, gt=0)
    kind: str | None = Field(default=None, pattern="^(income|expense)$")
    transaction_date: date | None = None
    category_id: int | None = None
    notes: str | None = Field(default=None, max_length=1000)


class TransactionRead(BaseModel):
    id: int
    title: str
    amount: float
    kind: str
    transaction_date: date
    notes: str | None
    created_at: datetime | None
    category: CategoryRead

    model_config = {"from_attributes": True}
