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

## How it Looks

<img width="780" height="302" alt="Workflow Auditor Demo" src="https://github.com/user-attachments/assets/82b5ae52-46e8-4f3f-9e6c-063b3857b75f" />

## Disclaimer

> ⚠️ **This Forge app is provided for educational and demonstration purposes only.**
>
> If you plan to use this in a production environment, **please consult your development and security teams** to review the code for:
>
> - Compliance with your organization’s security policies
> - Proper audit logging and governance
> - Any additional performance or permission requirements
>
> The author is not responsible for any misuse, security vulnerabilities, or violations resulting from the deployment of this code.
