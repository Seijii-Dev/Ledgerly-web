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
  Moon,
  FileSpreadsheet,
  ShieldAlert,
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
    { id: "themes", title: "Appearance", icon: Moon },
    { id: "export", title: "Export data", icon: FileSpreadsheet },
    { id: "storage", title: "Data and privacy", icon: ShieldAlert },
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

              <div className="doc-callout">
                <ShieldAlert size={16} className="callout-icon" />
                <span>Ledgerly uses Supabase Authentication for sign-in and the Supabase cloud database for account and expense synchronization. The Android app keeps a local cache so your ledger remains available offline.</span>
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
              <p className="doc-p" style={{ marginTop: "12px" }}>
                The dashboard is designed to give users an immediate, intuitive understanding of their current financial situation.
              </p>
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

              <div className="doc-callout">
                <ShieldAlert size={16} className="callout-icon" />
                <span>When you are signed in and online, expenses sync to your Supabase account. Custom category names are stored on this device in this version.</span>
              </div>

              <div className="doc-example-box">
                <span className="example-badge">Example</span>
                <p className="example-text">If a student spends â‚±100 on lunch:</p>
                <ul className="example-list">
                  <li><strong>Amount:</strong> â‚±100</li>
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

              <div className="doc-example-box">
                <span className="example-badge">Budget Example</span>
                <p className="example-text">
                  A user sets a weekly spending cap. As transactions are logged, Ledgerly displays the remaining funds and spending progress to help prevent overspending.
                </p>
              </div>

              <div className="doc-callout">
                <ShieldAlert size={16} className="callout-icon" />
                <span>Ledgerly uses one weekly budget limit per account. It is saved to your profile and restored when you sign in on another device.</span>
              </div>
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
                The application supports financial tracking that empowers users to monitor their ongoing progress towardã}¶‰ËkºwµçG&öæsà¢Ç7ãäÖ¶R&öw&W72öæRFW÷6—BBF–ÖSÂ÷7ãà¢ÂöF—cà¢Å–vw”&æ²6—¦S×³‡Òóà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&vöÂ×7FFR#à¢Ç7â6Æ74æÖSÒ&vöÂÖÖ&²#ãÄ'&÷uW&–v‡B6—¦S×³wÒóãÂ÷7ãà¢ÆF—cãÇ7G&öæså7F'Bv—F‚&V6öãÂ÷7G&öæsãÇ7ãä6†ö÷6R6öÖWF†–ær–÷RvçBFò6fRf÷"ãÂ÷7ããÂöF—cà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&vöÂÖfö÷FW"#ãÇ7ãåG&6²B–÷W"÷vâ6SÂ÷7ããÂöF—cà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ'&öGV7BÖFWF–ÂÖ6÷’#à¢Æƒ3äÖ¶R6f–ærfVVÂ÷76–&ÆSÂöƒ3à¢Çå6WBvöÂF†BÖGFW'2Fò–÷RæB¶VW—Bf—6–&ÆRÆöæw6–FRWfW'–F’7VæF–ærâ6ÖÆÂÂ6öç6—7FVçB&V6÷&G2Ö¶R&öw&W72V6–W"Fò6VRãÂ÷à¢ÂöF—cà¢Âö'F–6ÆSà¢ÂöF—cà¢ÂöF—cà¢Â÷6V7F–öãà¢“°§Ğ