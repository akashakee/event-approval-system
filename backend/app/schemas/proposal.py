from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BudgetItemPayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    quantity: Decimal = Field(gt=0)
    cost_per_unit: Decimal = Field(gt=0)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("Budget item name is required.")
        return cleaned_value


class ProposalCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    event_date: date
    venue: str = Field(min_length=1, max_length=255)
    budget_items: list[BudgetItemPayload] = Field(min_length=1)

    @field_validator("title", "venue")
    @classmethod
    def validate_short_text(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("This field is required.")
        return cleaned_value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        cleaned_value = value.strip()
        if len(cleaned_value) < 20:
            raise ValueError("Description must be at least 20 characters.")
        return cleaned_value

    @field_validator("event_date")
    @classmethod
    def validate_event_date(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("Event date cannot be in the past.")
        return value

    @model_validator(mode="after")
    def validate_budget_items(self) -> "ProposalCreateRequest":
        if not self.budget_items:
            raise ValueError("At least one budget item is required.")
        return self


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
    remarks: str = Field(min_length=10, max_length=1000)

    @field_validator("remarks")
    @classmethod
    def validate_remarks(cls, value: str) -> str:
        cleaned_value = value.strip()
        if len(cleaned_value) < 10:
            raise ValueError("Remarks must be at least 10 characters.")
        return cleaned_value
