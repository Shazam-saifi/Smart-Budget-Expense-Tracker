from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import MonthlyReport
from app.services.analytics import build_dashboard_analytics

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/monthly", response_model=MonthlyReport)
def monthly_report(
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    report_month = month or today.month
    report_year = year or today.year
    analytics = build_dashboard_analytics(
        db,
        user_id=current_user.id,
        month=report_month,
        year=report_year,
    )
    return MonthlyReport(
        month=report_month,
        year=report_year,
        summary=analytics.summary,
        top_expense_categories=analytics.category_breakdown[:5],
        recommendations=analytics.recommendations,
    )
