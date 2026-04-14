# Final SRS - Event Proposal System

## 1. Purpose
This Software Requirements Specification defines the Phase 1 baseline for a university Event Proposal System. The system allows student event coordinators to submit event proposals and faculty advisors to review, approve, or reject them through a controlled workflow.

## 2. Scope
The Phase 1 release covers:

- Role-based access for `Student` and `Faculty`
- Student proposal creation, submission, tracking, and revision after rejection
- Faculty proposal review with approval or rejection
- Structured budget estimation using line items
- Read-only locking of proposals during review or after approval

Out of scope for Phase 1:

- Multi-level approvals
- File uploads
- Real payment or procurement processing
- Notifications by email/SMS
- Admin role
- Analytics dashboards

## 3. Product Vision
Provide a reliable digital workflow that replaces informal event proposal handling with a traceable, structured, and reviewable system for campus events.

## 4. User Roles

### 4.1 Student
Represents the event coordinator who prepares and submits proposals.

Permissions:

- Log in as student
- Create a proposal
- Add, edit, or remove budget items before submission
- View submitted proposals
- View proposal status
- Revise and resubmit only rejected proposals
- View faculty remarks

Restrictions:

- Cannot review proposals
- Cannot modify proposals in `Under Review` or `Approved` status
- Can only access own proposals

### 4.2 Faculty
Represents the faculty advisor who reviews submitted proposals.

Permissions:

- Log in as faculty
- View all proposals currently under review
- Open proposal details
- Approve a proposal
- Reject a proposal with mandatory remarks
- View already decided proposals in detail

Restrictions:

- Cannot create student proposals
- Cannot edit proposal content directly

## 5. Functional Requirements

### FR-1 Authentication and Session
- The system shall allow login using email and selected role.
- The system shall maintain session state for the active user.
- The system shall redirect unauthorized users to the login page.
- The system shall enforce role-based page access.

### FR-2 Student Dashboard
- The system shall display all proposals created by the logged-in student.
- The dashboard shall show proposal title, event date, venue, budget, and status.
- The dashboard shall sort proposals by most recently created first.

### FR-3 Proposal Creation
- The system shall allow a student to create a new event proposal.
- A proposal shall include:
  - Event title
  - Event description
  - Event date
  - Venue configuration
  - One or more budget line items
- The system shall require at least one valid budget item before submission.
- The system shall calculate subtotals and total estimated budget automatically.

### FR-4 Proposal Update and Resubmission
- The system shall allow editing of a rejected proposal.
- On resubmission, the proposal status shall return to `Under Review`.
- The system shall preserve the original proposal creation timestamp.

### FR-5 Proposal State Control
- The system shall support exactly three statuses in Phase 1:
  - `Under Review`
  - `Approved`
  - `Rejected`
- The system shall lock proposals from student editing while status is `Under Review` or `Approved`.
- The system shall display faculty remarks for approved or rejected proposals.

### FR-6 Faculty Dashboard
- The system shall show faculty only proposals with status `Under Review`.
- The dashboard shall display coordinator email, execution date, and requested budget.
- The dashboard shall sort pending proposals oldest first to support queue processing.

### FR-7 Faculty Review
- The system shall show complete proposal details to faculty.
- Faculty shall be able to approve with optional remarks.
- Faculty shall be able to reject only if remarks are provided.
- On review action, the system shall update proposal status and remarks.

## 6. Proposal Structure Freeze

### 6.1 Proposal Entity
The proposal structure is frozen for Phase 1 as:

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | String | Yes | Unique proposal identifier |
| `studentEmail` | String | Yes | Proposal owner |
| `title` | String | Yes | Event name |
| `description` | Text | Yes | Purpose, audience, activities |
| `eventDate` | Date | Yes | Planned event date |
| `venue` | String | Yes | Venue or setup configuration |
| `budgetItems` | Array | Yes | List of resource items |
| `estimatedBudget` | Decimal | Yes | Sum of all budget item totals |
| `status` | Enum | Yes | `Under Review`, `Approved`, `Rejected` |
| `remarks` | Text | No | Faculty comments |
| `createdAt` | DateTime | Yes | Original creation timestamp |

### 6.2 Budget Item Structure

| Field | Type | Required | Description |
|---|---|---:|---|
| `name` | String | Yes | Resource or item name |
| `quantity` | Number | Yes | Requested amount |
| `costPerUnit` | Decimal | Yes | Unit cost |
| `totalCost` | Decimal | Yes | `quantity * costPerUnit` |

## 7. Budget Model Freeze
The budget model for Phase 1 is fixed as a line-item estimation model.

Rules:

- Total proposal budget = sum of all `totalCost` values
- `quantity` must be greater than or equal to 1
- `costPerUnit` must be greater than or equal to 0
- Budget items without a valid item name shall not be saved
- Currency display is INR
- No taxes, discounts, approval caps, or funding-source splits are included in Phase 1

Formula:

`totalCost = quantity x costPerUnit`

`estimatedBudget = sum(totalCost for all budgetItems)`

## 8. Non-Functional Requirements

### 8.1 Usability
- The interface shall be simple enough for first-time student users.
- The workflow shall use clear status visibility.
- Forms shall provide immediate budget recalculation feedback.

### 8.2 Security
- The backend version shall require authenticated sessions.
- The backend version shall enforce authorization checks server-side.
- Users shall only access resources allowed for their role.

### 8.3 Reliability
- Proposal state transitions shall be consistent and traceable.
- Review decisions shall persist without data loss.

### 8.4 Performance
- Common dashboard and detail views should load in under 2 seconds under normal campus network conditions.

### 8.5 Maintainability
- The backend API and data model shall remain aligned with the frozen Phase 1 proposal structure.
- Business rules shall be centralized in backend services in the production implementation.

## 9. Business Rules
- A student can only modify a proposal when status is `Rejected` or before first submission.
- A faculty user can approve or reject only proposals in `Under Review`.
- Rejection requires remarks.
- Approval remarks are optional.
- A proposal belongs to exactly one student.
- A proposal review decision is made by one faculty user in Phase 1.

## 10. Assumptions and Constraints
- The initial system has only two roles.
- One proposal is reviewed by one faculty advisor in Phase 1.
- The current prototype uses browser storage, but the production system will use a backend API and database.
- Institution-specific policies such as budget caps or venue approval dependencies are not yet modeled.

## 11. Acceptance Criteria
- Students can submit a proposal with at least one budget item.
- Faculty can see all pending proposals.
- Faculty can approve or reject a proposal.
- Rejected proposals become editable by the original student.
- Approved and under-review proposals remain read-only for students.
- All proposal totals are calculated correctly from budget items.
