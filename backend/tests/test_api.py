from datetime import date


def register_and_authenticate(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Shazam Saifi",
            "email": "shazam@example.com",
            "password": "securepass",
        },
    )
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_registration_seeds_categories(client):
    headers = register_and_authenticate(client)
    categories_response = client.get("/api/categories", headers=headers)
    assert categories_response.status_code == 200
    categories = categories_response.json()
    assert any(category["name"] == "Food" for category in categories)
    assert any(category["kind"] == "income" for category in categories)


def test_budget_and_analytics_flow(client):
    headers = register_and_authenticate(client)
    categories = client.get("/api/categories", headers=headers).json()
    food_category = next(item for item in categories if item["name"] == "Food")
    salary_category = next(item for item in categories if item["name"] == "Salary")

    budget_response = client.post(
        "/api/budgets",
        headers=headers,
        json={"amount": 300, "month": 4, "year": 2026, "category_id": food_category["id"]},
    )
    assert budget_response.status_code == 201

    income_response = client.post(
        "/api/transactions",
        headers=headers,
        json={
            "title": "April salary",
            "amount": 2000,
            "kind": "income",
            "transaction_date": str(date(2026, 4, 1)),
            "category_id": salary_category["id"],
            "notes": "Monthly salary",
        },
    )
    assert income_response.status_code == 201

    expense_response = client.post(
        "/api/transactions",
        headers=headers,
        json={
            "title": "Groceries",
            "amount": 120,
            "kind": "expense",
            "transaction_date": str(date(2026, 4, 2)),
            "category_id": food_category["id"],
            "notes": "Weekly groceries",
        },
    )
    assert expense_response.status_code == 201

    analytics_response = client.get("/api/analytics/dashboard?month=4&year=2026", headers=headers)
    assert analytics_response.status_code == 200
    payload = analytics_response.json()
    assert payload["summary"]["total_income"] == 2000
    assert payload["summary"]["total_expenses"] == 120
    assert payload["budget_status"][0]["usage_percent"] == 40
