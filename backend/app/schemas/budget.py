from pydantic import BaseModel, Field

from app.schemas.category import CategoryRead


class BudgetCreate(BaseModel):
    amount: float = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)
    category_id: int


class BudgetRead(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category: CategoryRead

    model_config = {"from_attributes": True}


class BudgetStatus(BaseModel):
    budget_id: int
    category_name: str
    budget_amount: float
    spent_amount: float
    usage_percent: float
    remaining_amount: float
    alert_level: str
