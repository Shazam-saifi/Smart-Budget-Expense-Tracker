from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    kind: str = Field(pattern="^(income|expense)$")


class CategoryRead(BaseModel):
    id: int
    name: str
    kind: str
    is_default: bool

    model_config = {"from_attributes": True}
