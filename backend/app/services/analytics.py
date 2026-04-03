from collections import defaultdict
from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.analytics import (
    CategorySpend,
    DashboardAnalytics,
    Recommendation,
    SpendingTrendPoint,
    SummaryCard,
)
from app.schemas.budget import BudgetStatus


def _round(value: float) -> float:
    return round(value, 2)


def build_budget_status(
    db: Session,
    *,
    user_id: int,
    month: int,
    year: int,
) -> list[BudgetStatus]:
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == user_id, Budget.month == month, Budget.year == year)
        .all()
    )
    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(
            Transaction.user_id == user_id,
            Transaction.kind == "expense",
            Transaction.transaction_date >= date(year, month, 1),
            Transaction.transaction_date < (
                date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
            ),
        )
        .all()
    )
    spent_by_category: dict[int, float] = defaultdict(float)
    for transaction in transactions:
        spent_by_category[transaction.category_id] += transaction.amount

    statuses: list[BudgetStatus] = []
    for budget in budgets:
        spent = spent_by_category.get(budget.category_id, 0.0)
        usage = (spent / budget.amount * 100) if budget.amount else 0.0
        if usage >= 100:
            alert_level = "critical"
        elif usage >= 80:
            alert_level = "warning"
        else:
            alert_level = "healthy"
        statuses.append(
            BudgetStatus(
                budget_id=budget.id,
                category_name=budget.category.name,
                budget_amount=_round(budget.amount),
                spent_amount=_round(spent),
                usage_percent=_round(usage),
                remaining_amount=_round(budget.amount - spent),
                alert_level=alert_level,
            )
        )
    return statuses


def build_recommendations(summary: SummaryCard, budget_status: list[BudgetStatus]) -> list[Recommendation]:
    recommendations: list[Recommendation] = []
    if summary.total_expenses > summary.total_income:
        recommendations.append(
            Recommendation(
                title="Expenses are higher than income",
                description="Review your largest categories and pause non-essential spending this month.",
                severity="high",
            )
        )
    if summary.savings_rate < 20:
        recommendations.append(
            Recommendation(
                title="Savings rate is below target",
                description="Aim to save at least 20% of income by setting stricter category budgets.",
                severity="medium",
            )
        )
    for budget in budget_status:
        if budget.usage_percent >= 100:
            recommendations.append(
                Recommendation(
                    title=f"{budget.category_name} budget exceeded",
                    description=f"You have overspent by {_round(abs(budget.remaining_amount))} in {budget.category_name}.",
                    severity="high",
                )
            )
        elif budget.usage_percent >= 80:
            recommendations.append(
                Recommendation(
                    title=f"{budget.category_name} budget almost reached",
                    description=f"{budget.category_name} is already at {budget.usage_percent}% of its budget.",
                    severity="medium",
                )
            )
    if not recommendations:
        recommendations.append(
            Recommendation(
                title="Finances look healthy",
                description="Keep maintaining balanced spending and review your budgets weekly.",
                severity="low",
            )
        )
    return recommendations


def build_dashboard_analytics(
    db: Session,
    *,
    user_id: int,
    month: int,
    year: int,
) -> DashboardAnalytics:
    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    period_start = date(year, month, 1)
    period_end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    selected_transactions = [
        transaction
        for transaction in transactions
        if period_start <= transaction.transaction_date < period_end
    ]

    total_income = sum(t.amount for t in selected_transactions if t.kind == "income")
    total_expenses = sum(t.amount for t in selected_transactions if t.kind == "expense")
    net_savings = total_income - total_expenses
    savings_rate = (net_savings / total_income * 100) if total_income else 0.0
    summary = SummaryCard(
        total_income=_round(total_income),
        total_expenses=_round(total_expenses),
        net_savings=_round(net_savings),
        savings_rate=_round(savings_rate),
    )

    category_totals: dict[str, float] = defaultdict(float)
    trend_totals: dict[str, dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for transaction in selected_transactions:
        if transaction.kind == "expense":
            category_totals[transaction.category.name] += transaction.amount
    for transaction in transactions:
        trend_key = transaction.transaction_date.strftime("%Y-%m")
        trend_totals[trend_key][transaction.kind] += transaction.amount

    category_breakdown = [
        CategorySpend(category_name=name, amount=_round(amount))
        for name, amount in sorted(category_totals.items(), key=lambda item: item[1], reverse=True)
    ]
    spending_trends = [
        SpendingTrendPoint(
            period=period,
            income=_round(values["income"]),
            expense=_round(values["expense"]),
        )
        for period, values in sorted(trend_totals.items())
    ]
    budget_status = build_budget_status(db, user_id=user_id, month=month, year=year)
    recommendations = build_recommendations(summary, budget_status)
    return DashboardAnalytics(
        summary=summary,
        category_breakdown=category_breakdown,
        spending_trends=spending_trends,
        budget_status=budget_status,
        recommendations=recommendations,
    )
