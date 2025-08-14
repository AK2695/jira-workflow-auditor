import api, { route, storage } from "@forge/api";

const PROJECT_KEY = "TEST";        // change to your project key
const ISSUE_TYPE_NAME = "Task";    // change to your issue type

export async function run(event, context) {
  try {
    const lastRunStored = await storage.get("lastRun");
    const lastRun = typeof lastRunStored === "number"
      ? lastRunStored
      : Date.now() - 1000 * 60 * 15; // default: 15 min back
    const now = Date.now();

    const response = await api.asApp().requestJira(
      route`/rest/api/3/auditing/record?limit=100`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      console.error("Failed to fetch audit logs:", await response.text());
      return;
    }

    const data = await response.json();

    const workflowEvents = (data.records || []).filter((rec) => {
      const createdTime = Date.parse(rec.created);
      const category = rec.category?.toLowerCase();
      return category === "workflows" && createdTime > lastRun;
    });

    if (!workflowEvents.length) {
      console.log("No new workflow updates found.");
      await storage.set("lastRun", now);
      return;
    }

    for (const evt of workflowEvents) {
      const workflowName = evt.objectItem?.name || "Unnamed Workflow";
      const timestamp = new Date(evt.created).toUTCString();
      const authorKey = evt.authorAccountId || evt.authorKey;

      let authorName = "Unknown";
      let authorAccountId = null;

      if (authorKey) {
        try {
          const userResp = await api.asApp().requestJira(
            route`/rest/api/3/user?accountId=${authorKey}`,
            { headers: { Accept: "application/json" } }
          );
          if (userResp.ok) {
            const user = await userResp.json();
            authorName = user.displayName || authorKey;
            authorAccountId = user.accountId || null;
          } else {
            console.warn("User lookup failed:", await userResp.text());
          }
        } catch (e) {
          console.warn("Could not resolve user from authorKey:", authorKey, e);
        }
      }

      const summary = `Workflow Updated: ${workflowName}`;

      let details =
        `*Workflow Update Detected*\n` +
        `**Workflow**: ${workflowName}\n` +
        `**Changed By**: ${authorName}\n` +
        `**Timestamp**: ${timestamp}\n` +
        `**Summary**: ${evt.summary || "No summary"}\n` +
        `**Category**: ${evt.category || "N/A"}`;

      if (Array.isArray(evt.changedValues) && evt.changedValues.length) {
        const lines = evt.changedValues.map((c) => {
          const from = c.changedFrom ?? "None";
          const to = c.changedTo ?? "New";
          return `- ${c.fieldName}: ${from} → ${to}`;
        });
        details += `\n**Changes:**\n${lines.join("\n")}`;
      }

      const descriptionADF = {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: details }] },
        ],
      };

      const fields = {
        project: { key: PROJECT_KEY },
        summary,
        description: descriptionADF,
        issuetype: { name: ISSUE_TYPE_NAME },
      };
      if (authorAccountId) fields.assignee = { accountId: authorAccountId };

      const createIssueResp = await api.asApp().requestJira(
        route`/rest/api/3/issue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ fields }),
        }
      );

      if (!createIssueResp.ok) {
        console.error(
          "Failed to create issue:",
          createIssueResp.status,
          await createIssueResp.text()
        );
      } else {
        const created = await createIssueResp.json();
        console.log(
          `Issue created: ${created.key}${
            authorName ? ` (assigned to ${authorName})` : ""
          }`
        );
      }
    }

    await storage.set("lastRun", now);
  } catch (error) {
    console.error("Unexpected error during execution:", error);
  }
}