import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Minus, Plus } from "lucide-react";

const expenses = [
  { name: "Breakfast", category: "Food", amount: 50 },
  { name: "Jeepney fare", category: "Transport", amount: 80 },
  { name: "Lunch", category: "Food", amount: 100 },
  { name: "School supplies", category: "Education", amount: 70 },
];

export function LedgerPreview() {
  const [allowance, setAllowance] = useState(500);
  const spent = useMemo(() => expenses.reduce((total, expense) => total + expense.amount, 0), []);
  const remaining = allowance - spent;
  const progress = Math.min(100, (spent / allowance) * 100);

  return (
    <section className="ledger-preview" data-ui aria-label="Interactive daily spending example">
      <div className="ledger-preview-head">
        <div>
          <p className="ledger-preview-label">Today’s spending</p>
          <p className="ledger-preview-date">A sample day in Ledgerly</p>
        </div>
        <span className="ledger-preview-mark" aria-hidden="true">₱</span>
      </div>

      <div className="ledger-amount-row">
        <div>
          <span className="ledger-amount-label">Spent today</span>
          <strong className="ledger-amount">₱{spent.toLocaleString("en-PH")}</strong>
        </div>
        <div className="ledger-remaining">
          <span className="ledger-amount-label">Left from allowance</span>
          <strong className={remaining < 0 ? "ledger-amount is-over" : "ledger-amount"}>
            {remaining < 0 ? "−" : ""}₱{Math.abs(remaining).toLocaleString("en-PH")}
          </strong>
        </div>
      </div>

      <div className="ledger-progress" role="progressbar" aria-label="Daily allowance spent" aria-valuemin={0} aria-valuemax={allowance} aria-valuenow={spent}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="ledger-allowance-control">
        <span>Daily allowance</span>
        <div className="allowance-stepper">
          <button type="button" aria-label="Decrease allowance by 50 pesos" onClick={() => setAllowance((amount) => Math.max(300, amount - 50))} disabled={allowance <= 300}>
            <Minus size={14} />
          </button>
          <strong>₱{allowance.toLocaleString("en-PH")}</strong>
          <button type="button" aria-label="Increase allowance by 50 pesos" onClick={() => setAllowance((amount) => Math.min(1500, amount + 50))} disabled={allowance >= 1500}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="ledger-transactions">
        {expenses.map((expense) => (
          <div className="ledger-transaction" key={expense.name}>
            <span className="ledger-transaction-icon" aria-hidden="true"><ArrowUpRight size={15} /></span>
            <span className="ledger-transaction-name">{expense.name}<small>{expense.category}</small></span>
            <strong>−₱{expense.amount}</strong>
          </div>
        ))}
      </div>

      <div className="ledger-total-row">
        <span><ArrowDownLeft size={15} /> 4 expenses recorded</span>
        <strong>₱{spent.toLocaleString("en-PH")}</strong>
      </div>
      <p className="ledger-note">Change the allowance to see what remains.</p>
    </section>
  );
}
