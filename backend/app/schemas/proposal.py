from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class BudgetItemPayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    quantity: Decimal = Field(gt=0)
    cost_per_unit: Decimal = Field(gt=0)


class ProposalCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    event_date: date
    venue: str = Field(min_length=1, max_length=255)
    budget_items: list[BudgetItemPayload] = Field(min_length=1)


class ProposalUpdateRequest(ProposalCreateRequest):
    pass


class BudgetItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    quantity: Decimal
    cost_per_unit: Decimal
    total_cost: Decimal


class ProposalStudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class ReviewDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    decision: str
    remarks: str
    reviewed_at: datetime


class ProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    event_date: date
    venue: str
    estimated_budget: Decimal
    status: str
    remarks: str | None
    created_at: datetime
    updated_at: datetime
    budget_items: list[BudgetItemResponse]
    student: ProposalStudentResponse | None = None
    review_decisions: list[ReviewDecisionResponse] = Field(default_factory=list)


class ReviewDecisionRequest(BaseModel):
    remarks: str = Field(min_length=1)
