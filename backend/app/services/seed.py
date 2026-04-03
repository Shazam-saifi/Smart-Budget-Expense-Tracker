from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.user import User

DEFAULT_CATEGORIES = {
    "income": ["Salary", "Freelance", "Scholarship", "Bonus"],
    "expense": ["Food", "Rent", "Transport", "Shopping", "Health", "Entertainment"],
}


def seed_default_categories(db: Session, user: User) -> None:
    existing = (
        db.query(Category)
        .filter(Category.user_id == user.id)
        .count()
    )
    if existing:
        return

    categories = [
        Category(name=name, kind=kind, is_default=True, user_id=user.id)
        for kind, names in DEFAULT_CATEGORIES.items()
        for name in names
    ]
    db.add_all(categories)
    db.commit()
