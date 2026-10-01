# SMART SPENDING & SAVINGS TRACKER

## User Documentation

### 1. Introduction

Smart Spending & Savings Tracker is a mobile application designed to help users manage their daily finances. It allows users to record expenses, monitor their spending habits, set budgets, track savings, and view spending reports. The application provides an organized and convenient way to understand where money is being spent and encourage better financial management.

---

## 2. Getting Started

When the application is opened, the user will be presented with the welcome screen.

From the welcome screen, the user can proceed to create an account or log in if an account has already been created.

### First-Time Users

1. Open the Smart Spending & Savings Tracker application.
2. Select the **Register** option.
3. Enter the required account information.
4. Create your account.
5. After successful registration, log in using your account credentials.
6. The application will take you to the main dashboard.

### Existing Users

1. Open the application.
2. Select **Login**.
3. Enter your registered credentials.
4. Select the login button.
5. After successful authentication, the dashboard will appear.

Ledgerly uses the Ledgerly Backend for account authentication and cloud synchronization. The Android app also caches account and expense data locally for offline use.

---

## 3. Dashboard

The **Dashboard** serves as the main screen of the application.

It provides an overview of the user's financial activity and allows the user to quickly access important features.

The dashboard can be used to:

- View financial information.
- Check recent transactions.
- Monitor spending activity.
- Access expense management.
- Review spending reports.
- Manage budget settings.

The dashboard is designed to give users a quick understanding of their current spending situation.

---

## 4. Adding an Expense

The **Add Expense** feature allows users to record their daily spending.

### Steps:

1. Open the expense section.
2. Select **Add Expense**.
3. Enter the amount spent.
4. Select an appropriate category.
5. Enter the necessary expense details.
6. Save the transaction.

After saving, the expense will appear in the user's transaction records.

### Example:

If a student spends ₱100 on lunch:

- Amount: ₱100
- Category: Food
- Description: Lunch
- Save the transaction.

The expense can then be viewed in the transaction history and included in spending reports.

---

## 5. Editing an Expense

If an expense was entered incorrectly, the user can edit the transaction.

### Steps:

1. Open the transaction list.
2. Find the expense that needs to be changed.
3. Select the expense.
4. Choose the **Edit** option.
5. Update the incorrect information.
6. Save the changes.

The updated information will replace the previous transaction details.

---

## 6. Searching and Filtering Transactions

The application provides transaction search and category filtering features.

Users can search for specific transactions and filter their records according to categories.

### Steps:

1. Open the transaction section.
2. Use the search field to enter a keyword.
3. Select a category filter if needed.
4. Review the matching transactions.

This feature makes it easier to find specific expenses without manually checking every transaction.

---

## 7. Spending Reports

The **Spending Reports** section helps users understand their spending habits.

Users can review their recorded expenses and see how their spending is distributed.

Reports can help users identify:

- Frequently used spending categories.
- Overall spending activity.
- Changes in spending habits.
- Areas where they may want to reduce unnecessary expenses.

Regularly checking reports can help users become more aware of how they manage their money.

---

## 8. Budget Settings

The **Budget** feature allows users to establish a spending limit.

### Steps:

1. Open the budget settings.
2. Enter the desired budget amount.
3. Save the budget.
4. Continue recording expenses normally.
5. Monitor spending against the set budget.

### Example:

A user sets a monthly budget of **₱3,000**.

As expenses are recorded, the user can monitor their spending and compare it with the planned budget.

This helps users avoid unnecessary spending and develop better budgeting habits.

---

## 9. Savings Tracking

The application supports financial tracking that can help users monitor their progress toward saving goals.

Users can set financial goals and monitor their available funds while keeping track of their expenses.

For example, a student may set a goal to save money for a new school item. By recording expenses and controlling unnecessary spending, the user can better manage the amount they are able to save.

---

## 10. Dark and Light Mode

The application supports both **Light Mode** and **Dark Mode**.

Users can change the appearance of the application according to their preference.

### Steps:

1. Open the application settings.
2. Find the appearance or theme option.
3. Select **Light Mode** or **Dark Mode**.
4. The application interface will update accordingly.

The selected theme is persisted on the device.

---

## 11. Exporting Data

The application provides a **CSV export** feature.

CSV files can be useful when users want to keep a copy of their expense records or analyze their transactions using spreadsheet software.

### General Steps:

1. Open the appropriate data or transaction section.
2. Select the **Export CSV** option.
3. The application generates the expense data in CSV format.
4. Save or share the generated file as needed.

---

## 12. Data Storage and Privacy

Ledgerly uses an offline-first local cache together with the Ledgerly Backend.

Account authentication, budgets, and synchronized expense records use the backend API, while the Android app keeps local cached data for offline use. Secure session storage is handled by the Android app.

Users should export important records before clearing application data or uninstalling the application.

---

## 13. Logging Out

When finished using the application, the user can log out of their account.

### Steps:

1. Open the account or settings section.
2. Select **Log Out**.
3. Confirm the action if prompted.
4. The application will return to the login or welcome screen.

The user can log in again using their registered credentials.

---

## 14. Recommended Usage

For the best experience, users should:

- Record expenses immediately after spending.
- Use the correct category for every transaction.
- Review spending reports regularly.
- Set a realistic budget.
- Monitor spending against the budget.
- Check savings progress regularly.
- Avoid entering duplicate transactions.
- Keep important financial records backed up when necessary.

---

## 15. Example of Daily Usage

A student receives **₱500** for the day.

They record the following expenses:

| Expense | Category | Amount |
| --- | --- | ---: |
| Breakfast | Food | ₱50 |
| Transportation | Transport | ₱80 |
| Lunch | Food | ₱100 |
| School Supplies | Education | ₱70 |

**Total Expenses: ₱300**

The student can then use the remaining amount to plan their savings or other necessary expenses.

By consistently recording transactions, the user can identify spending patterns and make more informed financial decisions.

---

## 16. Summary

Smart Spending & Savings Tracker provides a simple way to record expenses, monitor spending, manage budgets, review financial activity, and develop better saving habits.

By using the application regularly, users can become more aware of where their money goes and make more organized financial decisions.

**Track your spending. Manage your budget. Build better saving habits.**

## APK publishing and hosting requirements

The website has two distinct layers:

- **Public release state:** `GET /api/apk/current` (or `/release.json`) returns the single active release. The public download buttons use its `downloadUrl`, so every visitor sees the same latest APK.
- **Admin publishing state:** the existing admin portal sends the selected local APK as a binary `POST /api/apk/upload`. The server validates the `.apk` extension and ZIP/APK signature, calculates the file size and SHA-256 checksum, removes the previous active APK, and atomically writes the replacement plus `release.json`.
- **Unpublish:** `DELETE /api/apk` removes the active APK and clears the release metadata.
- **Browser fallback:** IndexedDB/localStorage are only a local preview fallback when the API cannot be reached. They are not treated as global publication state.

### Repository-hosted APK workflow

For Vercel or Netlify, commit the APK at exactly:

```text
public/downloads/Ledgerly-app-release.apk
```

After the site is rebuilt, the public download UI automatically detects this file and uses it as the active APK. Replace that repository file with a newer build and redeploy to publish the replacement. This static workflow does not calculate a version or SHA-256 automatically; use the Node API workflow when runtime metadata and server-side replacement are required.

### Deployment limitation

`npm run start` requires a Node process with a **persistent writable filesystem**. APK binaries are stored in `public/downloads/` and release metadata in `public/release.json`; the server also syncs them to `dist/` when a build exists. Vercel and Netlify static deployments can serve a checked-in APK, but their static output cannot accept runtime uploads or persist/delete files from browser requests. For global admin upload/replace/delete, deploy the Node server (or replace the file layer with an external object store/database) and keep the process storage persistent.

The current admin login is a client-side gate inherited from the original project. It should not be considered a security boundary on an internet-facing deployment; put the API behind real server-side authentication or an authenticated reverse proxy before production use.
