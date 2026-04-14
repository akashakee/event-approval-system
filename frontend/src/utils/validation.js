export function validateLoginForm(formState) {
  const errors = {};

  if (!formState.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!formState.password.trim()) {
    errors.password = "Password is required.";
  } else if (formState.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!formState.role) {
    errors.role = "Select a role to continue.";
  }

  return errors;
}

export function validateProposalForm(formState) {
  const errors = {
    budget_items: [],
  };

  if (!formState.title.trim()) {
    errors.title = "Event title is required.";
  } else if (formState.title.trim().length < 5) {
    errors.title = "Event title must be at least 5 characters.";
  }

  if (!formState.venue.trim()) {
    errors.venue = "Venue is required.";
  }

  if (!formState.description.trim()) {
    errors.description = "Description is required.";
  } else if (formState.description.trim().length < 20) {
    errors.description =
      "Description should explain the event in at least 20 characters.";
  }

  if (!formState.event_date) {
    errors.event_date = "Event date is required.";
  } else if (new Date(formState.event_date) < new Date(new Date().toDateString())) {
    errors.event_date = "Event date cannot be in the past.";
  }

  formState.budget_items.forEach((item, index) => {
    const itemErrors = {};
    const quantity = Number(item.quantity);
    const costPerUnit = Number(item.cost_per_unit);

    if (!item.name.trim()) {
      itemErrors.name = "Item name is required.";
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      itemErrors.quantity = "Quantity must be greater than 0.";
    }

    if (!Number.isFinite(costPerUnit) || costPerUnit <= 0) {
      itemErrors.cost_per_unit = "Cost per unit must be greater than 0.";
    }

    errors.budget_items[index] = itemErrors;
  });

  const hasBudgetIssue = errors.budget_items.some(
    (itemErrors) => Object.keys(itemErrors).length > 0,
  );

  if (!formState.budget_items.length) {
    errors.form = "Add at least one budget item.";
  } else if (hasBudgetIssue) {
    errors.form = "Fix the highlighted budget item fields before submitting.";
  }

  return errors;
}

export function validateReviewRemarks(remarks) {
  const cleanedRemarks = remarks.trim();
  if (!cleanedRemarks) {
    return "Remarks are required before approving or rejecting.";
  }
  if (cleanedRemarks.length < 10) {
    return "Remarks should be at least 10 characters.";
  }
  return "";
}
