import { useEffect, useMemo, useState } from "react";

const emptyBudgetItem = { name: "", quantity: "1", cost_per_unit: "0" };

function buildInitialState(proposal) {
  if (!proposal) {
    return {
      title: "",
      description: "",
      event_date: "",
      venue: "",
      budget_items: [{ ...emptyBudgetItem }],
    };
  }

  return {
    title: proposal.title,
    description: proposal.description,
    event_date: proposal.event_date,
    venue: proposal.venue,
    budget_items: proposal.budget_items.map((item) => ({
      name: item.name,
      quantity: String(item.quantity),
      cost_per_unit: String(item.cost_per_unit),
    })),
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ProposalForm({
  activeProposal,
  isSaving,
  onCancelEdit,
  onSubmit,
}) {
  const [formState, setFormState] = useState(buildInitialState(activeProposal));

  useEffect(() => {
    setFormState(buildInitialState(activeProposal));
  }, [activeProposal]);

  const totalBudget = useMemo(
    () =>
      formState.budget_items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const costPerUnit = Number(item.cost_per_unit) || 0;
        return sum + quantity * costPerUnit;
      }, 0),
    [formState.budget_items],
  );

  function updateField(field, value) {
    setFormState((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  }

  function updateBudgetItem(index, field, value) {
    setFormState((currentValue) => ({
      ...currentValue,
      budget_items: currentValue.budget_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addBudgetItem() {
    setFormState((currentValue) => ({
      ...currentValue,
      budget_items: [...currentValue.budget_items, { ...emptyBudgetItem }],
    }));
  }

  function removeBudgetItem(index) {
    setFormState((currentValue) => ({
      ...currentValue,
      budget_items:
        currentValue.budget_items.length === 1
          ? currentValue.budget_items
          : currentValue.budget_items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await onSubmit(formState, activeProposal?.id ?? null);
      if (!activeProposal) {
        setFormState(buildInitialState(null));
      }
    } catch {
      // The parent hook already exposes the API error state.
    }
  }

  return (
    <form
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
            {activeProposal ? "Update rejected proposal" : "New proposal"}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {activeProposal ? activeProposal.title : "Create event proposal"}
          </h3>
        </div>
        {activeProposal ? (
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            onClick={onCancelEdit}
            type="button"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Event title
          </span>
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" onChange={(event) => updateField("title", event.target.value)} required value={formState.title} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Venue
          </span>
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" onChange={(event) => updateField("venue", event.target.value)} required value={formState.venue} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" onChange={(event) => updateField("description", event.target.value)} required value={formState.description} />
        </label>
        <label className="block md:max-w-xs">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Event date
          </span>
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" onChange={(event) => updateField("event_date", event.target.value)} required type="date" value={formState.event_date} />
        </label>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
              Budget items
            </p>
            <h4 className="mt-2 text-xl font-semibold text-slate-900">
              Estimated budget {formatCurrency(totalBudget)}
            </h4>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700" onClick={addBudgetItem} type="button">
            Add item
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {formState.budget_items.map((item, index) => {
            const lineTotal =
              (Number(item.quantity) || 0) * (Number(item.cost_per_unit) || 0);

            return (
              <div
                key={`${index}-${item.name}`}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.4fr_0.6fr_0.8fr_auto]"
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Item name
                  </span>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" onChange={(event) => updateBudgetItem(index, "name", event.target.value)} required value={item.name} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quantity
                  </span>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" min="0.01" onChange={(event) => updateBudgetItem(index, "quantity", event.target.value)} required step="0.01" type="number" value={item.quantity} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Cost / unit
                  </span>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500" min="0.01" onChange={(event) => updateBudgetItem(index, "cost_per_unit", event.target.value)} required step="0.01" type="number" value={item.cost_per_unit} />
                </label>
                <div className="flex flex-col justify-between gap-3">
                  <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    Total: {formatCurrency(lineTotal)}
                  </div>
                  <button className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={formState.budget_items.length === 1} onClick={() => removeBudgetItem(index)} type="button">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving} type="submit">
          {isSaving
            ? "Saving..."
            : activeProposal
              ? "Resubmit proposal"
              : "Submit proposal"}
        </button>
      </div>
    </form>
  );
}
