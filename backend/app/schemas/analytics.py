from pydantic import BaseModel

from app.schemas.budget import BudgetStatus


class SummaryCard(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float


class CategorySpend(BaseModel):
    category_name: str
    amount: float


class SpendingTrendPoint(BaseModel):
    period: str
    income: float
    expense: float


class Recommendation(BaseModel):
    title: str
    description: str
    severity: str


class DashboardAnalytics(BaseModel):
    summary: SummaryCard
    category_breakdown: list[CategorySpend]
    spending_trends: list[SpendingTrendPoint]
    budget_status: list[BudgetStatus]
    recommendations: list[Recommendation]
