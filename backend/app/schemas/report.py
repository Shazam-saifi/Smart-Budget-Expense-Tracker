from pydantic import BaseModel

from app.schemas.analytics import CategorySpend, Recommendation, SummaryCard


class MonthlyReport(BaseModel):
    month: int
    year: int
    summary: SummaryCard
    top_expense_categories: list[CategorySpend]
    recommendations: list[Recommendation]
