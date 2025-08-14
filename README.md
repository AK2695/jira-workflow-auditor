# Jira Workflow Auditor – Forge App

This Forge app automatically monitors **workflow changes in Jira Cloud** by scanning the [Audit Log](https://support.atlassian.com/jira-cloud-administration/docs/view-jira-audit-logs/). When a change is detected, it **creates a Jira issue** in your specified project with all the relevant details.

Ideal for **Jira Administrators**, **Governance Teams**, and **Audit Compliance** use cases.

---

## Features

- Scheduled to run **every 5 minutes** using Forge Scheduled Triggers
- Fetches audit logs and filters only **workflow-related changes**
- Automatically **creates a new issue** when a workflow is updated
- Issue contains:
  - Workflow name
  - Author who made the change
  - Timestamp
  - Change summary
  - Detailed changed values (from → to)
- Automatically assigns the issue to the change author (if assignable)

---
git clone https://github.com/your-username/jira-workflow-auditor.git
cd jira-workflow-auditor
