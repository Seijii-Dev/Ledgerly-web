import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  PieChart,
  PlusCircle,
  Edit3,
  Search,
  Sliders,
  PiggyBank,
  FileSpreadsheet,
  LogOut,
  Lightbulb,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Documentation() {
  const [activeSection, setActiveSection] = useState<string>("intro");
  const quickNavRef = useRef<HTMLElement>(null);

  const docSections = [
    { id: "intro", title: "Introduction", icon: BookOpen },
    { id: "getting-started", title: "Getting started", icon: Sparkles },
    { id: "dashboard", title: "Dashboard", icon: Layers },
    { id: "add-expense", title: "Add an expense", icon: PlusCircle },
    { id: "edit-expense", title: "Edit an expense", icon: Edit3 },
    { id: "search-filter", title: "Search and filter", icon: Search },
    { id: "reports", title: "Spending reports", icon: PieChart },
    { id: "budget", title: "Budget settings", icon: Sliders },
    { id: "savings", title: "Savings goals", icon: PiggyBank },
    { id: "export", title: "Export data", icon: FileSpreadsheet },
    { id: "logout", title: "Sign out", icon: LogOut },
    { id: "recommended", title: "Good habits", icon: Lightbulb },
    { id: "daily-example", title: "A sample day", icon: Calendar },
    { id: "summary", title: "Summary", icon: CheckCircle2 },
  ];

  const currentIndex = docSections.findIndex((s) => s.id === activeSection);
  const prevSection = currentIndex > 0 ? docSections[currentIndex - 1] : null;
  const nextSection = currentIndex < docSections.length - 1 ? docSections[currentIndex + 1] : null;

  const selectSection = (id: string) => {
    setActiveSection(id);
  };

  useEffect(() => {
    // Keep the selected section visible in the phone's horizontal guide rail.
    if (quickNavRef.current && window.matchMedia("(max-width: 700px)").matches) {
      const nav = quickNavRef.current;
      const activeBtn = nav.querySelector<HTMLElement>(`[data-chip-id="${activeSection}"]`);
      if (activeBtn) nav.scrollTo({ left: Math.max(0, activeBtn.offsetLeft - 12), behavior: "smooth" });
    }
  }, [activeSection]);

  const renderCardFooter = () => (
    <div className="doc-card-footer">
      {prevSection ? (
        <button
          onClick={() => selectSection(prevSection.id)}
          className="btn btn-secondary btn-sm doc-nav-btn doc-nav-prev"
        >
          <ChevronLeft size={14} />
          <span>Previous: {prevSection.title.replace(/^\d+\.\s*/, "")}</span>
        </button>
      ) : (
        <div className="doc-nav-placeholder" />
      )}

      <span className="doc-card-pagination">
        {currentIndex + 1} of {docSections.length}
      </span>

      {nextSection ? (
        <button
          onClick={() => selectSection(nextSection.id)}
          className="btn btn-secondary btn-sm doc-nav-btn doc-nav-next"
        >
          <span>Next: {nextSection.title.replace(/^\d+\.\s*/, "")}</span>
          <ChevronRight size={14} />
        </button>
      ) : (
        <div className="doc-nav-placeholder" />
      )}
    </div>
  );

  return (
    <section id="docs" className="section docs-section" aria-labelledby="docs-heading">
      <div className="container docs-container">
        {/* Section Header */}
        <div className="section-head docs-head">
          <h2 id="docs-heading" className="section-heading">The Ledgerly guide</h2>
          <p>Everything you need to start tracking expenses, manage your budget, and protect your data.</p>
        </div>

        <div className="docs-layout">
        <nav className="docs-quick-nav" aria-label="Guide sections" ref={quickNavRef}>
          {docSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                data-chip-id={sec.id}
                onClick={() => selectSection(sec.id)}
                aria-pressed={activeSection === sec.id}
                aria-controls="guide-content"
                className={`docs-nav-chip ${activeSection === sec.id ? "active" : ""}`}
              >
                <Icon size={13} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Single Card Display */}
        <div id="guide-content" className="docs-body docs-single-container">
          {/* 1. Introduction */}
          {activeSection === "intro" && (
            <article id="intro" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Introduction</h3>
              </div>
              <p className="doc-p">
                <strong>Smart Spending & Savings Tracker</strong> is a mobile application designed to help users manage their daily finances. It allows users to record expenses, monitor their spending habits, set budgets, track savings, and view spending reports. The application provides an organized and convenient way to understand where money is being spent and encourage better financial management.
              </p>
              {renderCardFooter()}
            </article>
          )}

          {/* 2. Getting Started */}
          {activeSection === "getting-started" && (
            <article id="getting-started" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Getting Started</h3>
              </div>
              <p className="doc-p">
                When the application is opened, the user will be presented with the welcome screen. From the welcome screen, the user can proceed to create an account or log in if an account has already been created.
              </p>

              <div className="doc-subblock">
                <h4 className="doc-subtitle">First-Time Users</h4>
                <ol className="doc-steps">
                  <li><span>Open the Smart Spending & Savings Tracker application.</span></li>
                  <li><span>Select the <strong>Register</strong> option.</span></li>
                  <li><span>Enter the required account information.</span></li>
                  <li><span>Create your account.</span></li>
                  <li><span>After successful registration, log in using your account credentials.</span></li>
                  <li><span>The application will take you to the main dashboard.</span></li>
                </ol>
              </div>

              <div className="doc-subblock">
                <h4 className="doc-subtitle">Existing Users</h4>
                <ol className="doc-steps">
                  <li><span>Open the application.</span></li>
                  <li><span>Select <strong>Login</strong>.</span></li>
                  <li><span>Enter your registered credentials.</span></li>
                  <li><span>Select the login button.</span></li>
                  <li><span>After successful authentication, the dashboard will appear.</span></li>
                </ol>
              </div>

              {renderCardFooter()}
            </article>
          )}

          {/* 3. Dashboard */}
          {activeSection === "dashboard" && (
            <article id="dashboard" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Dashboard</h3>
              </div>
              <p className="doc-p">
                The <strong>Dashboard</strong> serves as the main screen of the application. It provides an overview of the user's financial activity and allows the user to quickly access important features.
              </p>
              <div className="doc-features-list">
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>View financial information at a glance</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Check recent transactions</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Monitor spending activity</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Access expense management</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Review spending reports</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Manage budget settings</span>
                </div>
              </div>
              {renderCardFooter()}
            </article>
          )}

          {/* 4. Adding an Expense */}
          {activeSection === "add-expense" && (
            <article id="add-expense" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Adding an Expense</h3>
              </div>
              <p className="doc-p">
                The <strong>Add Expense</strong> feature allows users to record their daily spending quickly and accurately.
              </p>
              <ol className="doc-steps">
                <li><span>Open the expense section.</span></li>
                <li><span>Select <strong>Add Expense</strong>.</span></li>
                <li><span>Enter the amount spent.</span></li>
                <li><span>Select an appropriate category (e.g., Food, Transport, Education, Bills), or create a custom category name.</span></li>
                <li><span>Enter the necessary expense details and description.</span></li>
                <li><span>Save the transaction.</span></li>
              </ol>
              <p className="doc-p" style={{ marginTop: "10px" }}>
                After saving, the expense will appear in the user's transaction records.
              </p>

              <div className="doc-example-box">
                <span className="example-badge">Example</span>
                <p className="example-text">If a student spends ₱100 on lunch:</p>
                <ul className="example-list">
                  <li><strong>Amount:</strong> ₱100</li>
                  <li><strong>Category:</strong> Food</li>
                  <li><strong>Description:</strong> Lunch</li>
                  <li><strong>Result:</strong> Saved to transaction history and factored into spending reports.</li>
                </ul>
              </div>
              {renderCardFooter()}
            </article>
          )}

          {/* 5. Editing an Expense */}
          {activeSection === "edit-expense" && (
            <article id="edit-expense" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Editing an Expense</h3>
              </div>
              <p className="doc-p">
                If an expense was entered incorrectly, the user can easily modify or update the transaction details.
              </p>
              <ol className="doc-steps">
                <li><span>Open the transaction list.</span></li>
                <li><span>Find the expense that needs to be changed.</span></li>
                <li><span>Select the expense entry.</span></li>
                <li><span>Choose the <strong>Edit</strong> option.</span></li>
                <li><span>Update the incorrect information (amount, category, or note).</span></li>
                <li><span>Save the changes.</span></li>
              </ol>
              <p className="doc-p" style={{ marginTop: "10px" }}>
                The updated information will immediately replace the previous transaction details in all reports and balance totals.
              </p>
              {renderCardFooter()}
            </article>
          )}

          {/* 6. Searching and Filtering Transactions */}
          {activeSection === "search-filter" && (
            <article id="search-filter" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Searching & Filtering Transactions</h3>
              </div>
              <p className="doc-p">
                The application provides real-time transaction search and category filtering features so users can pinpoint past entries without manual scrolling.
              </p>
              <ol className="doc-steps">
                <li><span>Open the transaction section.</span></li>
                <li><span>Use the search field to enter a keyword (e.g. "Lunch", "Jeepney").</span></li>
                <li><span>Select a category filter if needed.</span></li>
                <li><span>Review the matching transactions in real time.</span></li>
              </ol>
              {renderCardFooter()}
            </article>
          )}

          {/* 7. Spending Reports */}
          {activeSection === "reports" && (
            <article id="reports" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Spending Reports</h3>
              </div>
              <p className="doc-p">
                The <strong>Spending Reports</strong> section helps users understand their spending distribution through automated visual breakdowns.
              </p>
              <p className="doc-p">Reports help users identify:</p>
              <ul className="doc-bullet-list">
                <li>Frequently used spending categories.</li>
                <li>Overall spending volume and daily velocity.</li>
                <li>Changes and trends in spending habits over time.</li>
                <li>Areas where they may want to reduce unnecessary micro-expenses.</li>
              </ul>
              <p className="doc-p" style={{ marginTop: "10px" }}>
                Regularly reviewing reports enables informed adjustments to personal spending and savings goals.
              </p>
              {renderCardFooter()}
            </article>
          )}

          {/* 8. Budget Settings */}
          {activeSection === "budget" && (
            <article id="budget" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Budget Settings</h3>
              </div>
              <p className="doc-p">
                The <strong>Budget</strong> feature allows users to set a weekly spending limit to keep finances under control.
              </p>
              <ol className="doc-steps">
                <li><span>Open budget settings.</span></li>
                <li><span>Enter the desired weekly budget limit.</span></li>
                <li><span>Save the budget configuration.</span></li>
                <li><span>Continue recording expenses normally.</span></li>
                <li><span>Monitor ongoing spending progress against the set limit.</span></li>
              </ol>

              {renderCardFooter()}
            </article>
          )}

          {/* 9. Savings Tracking */}
          {activeSection === "savings" && (
            <article id="savings" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Savings Tracking</h3>
              </div>
              <p className="doc-p">
                The application supports financial tracking that empowers users to monitor their ongoing progress toward specific savings milestones.
              </p>
              <p className="doc-p">
                Users can define financial goals and monitor their accumulated reserves while keeping daily expenses disciplined. For instance, a student can set a target to save for new school equipment or an emergency fund, managing their saving rate directly alongside daily expenditures.
              </p>
              {renderCardFooter()}
            </article>
          )}

          {/* 11. Exporting Data */}
          {activeSection === "export" && (
            <article id="export" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Exporting Data (CSV)</h3>
              </div>
              <p className="doc-p">
                The application features a built-in <strong>CSV export</strong> utility, allowing users to extract their transaction records for external archiving or spreadsheet analysis in Microsoft Excel, Google Sheets, or Apple Numbers.
              </p>
              <ol className="doc-steps">
                <li><span>Open the transaction or data management screen.</span></li>
                <li><span>Select the <strong>Export CSV</strong> option.</span></li>
                <li><span>The application compiles all expense records into standardized CSV format.</span></li>
                <li><span>Save or share the file to local device storage or external apps.</span></li>
              </ol>
              {renderCardFooter()}
            </article>
          )}

          {/* 13. Logging Out */}
          {activeSection === "logout" && (
            <article id="logout" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Logging Out</h3>
              </div>
              <p className="doc-p">
                When finished using the application, users can securely end their session.
              </p>
              <ol className="doc-steps">
                <li><span>Open the account or settings section.</span></li>
                <li><span>Select <strong>Log Out</strong>.</span></li>
                <li><span>Confirm the logout prompt.</span></li>
                <li><span>The application clears the active session and returns to the welcome screen.</span></li>
              </ol>
              {renderCardFooter()}
            </article>
          )}

          {/* 14. Recommended Usage */}
          {activeSection === "recommended" && (
            <article id="recommended" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Recommended Usage Practices</h3>
              </div>
              <div className="doc-features-list">
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Record expenses immediately after spending to ensure 100% accuracy.</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Assign the correct category to every transaction for actionable reports.</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Review spending reports regularly at the end of each week.</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Set realistic budgets that account for unexpected daily needs.</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Monitor savings progress weekly to stay motivated toward financial goals.</span>
                </div>
                <div className="doc-feature-item">
                  <CheckCircle2 size={15} className="feature-check" />
                  <span>Export important financial records to CSV periodically.</span>
                </div>
              </div>
              {renderCardFooter()}
            </article>
          )}

          {/* 15. Example of Daily Usage */}
          {activeSection === "daily-example" && (
            <article id="daily-example" className="doc-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Example of Daily Usage</h3>
              </div>
              <p className="doc-p">
                Consider a student who receives a daily allowance of <strong>₱500</strong> and records their day's expenses:
              </p>

              <div className="doc-table-wrap">
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Expense Item</th>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Breakfast</td>
                      <td><span className="table-badge">Food</span></td>
                      <td className="text-right">₱50</td>
                    </tr>
                    <tr>
                      <td>Transportation</td>
                      <td><span className="table-badge">Transport</span></td>
                      <td className="text-right">₱80</td>
                    </tr>
                    <tr>
                      <td>Lunch</td>
                      <td><span className="table-badge">Food</span></td>
                      <td className="text-right">₱100</td>
                    </tr>
                    <tr>
                      <td>School Supplies</td>
                      <td><span className="table-badge">Education</span></td>
                      <td className="text-right">₱70</td>
                    </tr>
                    <tr className="table-total-row">
                      <td colSpan={2}><strong>Total Daily Expenses</strong></td>
                      <td className="text-right total-amount"><strong>₱300</strong></td>
                    </tr>
                    <tr className="table-savings-row">
                      <td colSpan={2}><strong>Remaining for Savings</strong></td>
                      <td className="text-right savings-amount"><strong>₱200</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="doc-p" style={{ marginTop: "14px" }}>
                By consistently logging daily micro-expenses, the user identifies exactly where the ₱300 went and sets aside the remaining ₱200 toward their savings goal.
              </p>
              {renderCardFooter()}
            </article>
          )}

          {/* 16. Summary */}
          {activeSection === "summary" && (
            <article id="summary" className="doc-card doc-summary-card doc-card-active">
              <div className="doc-card-head">
                <h3 className="doc-card-title">Summary</h3>
              </div>
              <p className="doc-p">
                <strong>Smart Spending & Savings Tracker</strong> provides a simple, structured way to record expenses, monitor spending, manage budgets, review financial activity, and develop better saving habits.
              </p>
              <p className="doc-p">
                By using the application regularly, users can become more conscious of where their money goes and make more organized, empowered financial decisions.
              </p>
              <p className="doc-p">
                Your account and expenses can follow you across signed-in devices through Supabase, while custom categories and preferences remain on the device in this version.
              </p>
              <div className="doc-motto-box">
                <p className="doc-motto">
                  "Track your spending. Manage your budget. Build better saving habits."
                </p>
              </div>
              {renderCardFooter()}
            </article>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
