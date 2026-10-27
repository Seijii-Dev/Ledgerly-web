import { ArrowUpRight, Coffee, BusFront, BookOpen, ChevronRight, PiggyBank, SlidersHorizontal } from "lucide-react";

const categories = [
  { name: "Food", amount: 150, Icon: Coffee },
  { name: "Transport", amount: 80, Icon: BusFront },
  { name: "Education", amount: 70, Icon: BookOpen },
];

export function ProductDetails() {
  return (
    <section className="product-details" aria-labelledby="product-details-heading">
      <div className="container product-details-inner">
        <header className="product-details-head">
          <h2 id="product-details-heading">Small entries. A clearer picture.</h2>
          <p>Ledgerly brings everyday records, monthly limits, and savings goals into one simple routine.</p>
        </header>

        <div className="product-detail-list">
          <article className="product-detail-row">
            <div className="detail-fragment category-fragment" data-ui aria-label="Sample daily expense breakdown">
              <div className="fragment-heading">
                <div>
                  <strong>Daily breakdown</strong>
                  <span>Sample day · ₱300 spent</span>
                </div>
                <span className="fragment-date">Today</span>
              </div>
              <div className="category-rows">
                {categories.map(({ name, amount, Icon }) => (
                  <div className="category-row" key={name}>
                    <span className="category-label"><Icon size={15} />{name}</span>
                    <span className="category-track"><i style={{ width: `${(amount / 150) * 100}%` }} /></span>
                    <strong>₱{amount}</strong>
                  </div>
                ))}
              </div>
              <div className="fragment-footer"><span>3 categories</span><strong>₱300</strong></div>
            </div>
            <div className="product-detail-copy">
              <h3>Know where the day went</h3>
              <p>Record each purchase, then see your spending grouped by category. This sample matches the ₱300 daily example in the guide.</p>
            </div>
          </article>

          <article className="product-detail-row">
            <div className="detail-fragment budget-fragment" data-ui aria-label="Example monthly budget setting">
              <div className="fragment-heading">
                <div>
                  <strong>Monthly budget</strong>
                  <span>A sample limit from the guide</span>
                </div>
                <SlidersHorizontal size={17} />
              </div>
              <div className="budget-limit-row">
                <strong>₱3,000</strong>
                <span>per month</span>
              </div>
              <div className="budget-setting-row"><span>Budget limit</span><span className="setting-value">₱3,000 <ChevronRight size={15} /></span></div>
              <p className="fragment-helper">Your limit is saved to your profile.</p>
            </div>
            <div className="product-detail-copy">
              <h3>Give your month a boundary</h3>
              <p>Set one monthly spending limit and check it as expenses come in. Change the amount any time from Budget settings.</p>
            </div>
          </article>

          <article className="product-detail-row">
            <div className="detail-fragment savings-fragment" data-ui aria-label="Savings goal example">
              <div className="fragment-heading">
                <div>
                  <strong>Savings goals</strong>
                  <span>Make progress one deposit at a time</span>
                </div>
                <PiggyBank size={18} />
              </div>
              <div className="goal-state">
                <span className="goal-mark"><ArrowUpRight size={17} /></span>
                <div><strong>Start with a reason</strong><span>Choose something you want to save for.</span></div>
              </div>
              <div className="goal-footer"><span>Track at your own pace</span></div>
            </div>
            <div className="product-detail-copy">
              <h3>Make saving feel possible</h3>
              <p>Set a goal that matters to you and keep it visible alongside everyday spending. Small, consistent records make progress easier to see.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
