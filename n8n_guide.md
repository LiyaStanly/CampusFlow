# CampusFlow: Member 3 Guide (n8n + Google Calendar)

This guide walks you through importing the pre-built workflows, linking Google Calendar, and testing the automation.

---

## 🛠 Step 1: Set Up n8n Cloud
1. Go to [n8n.cloud](https://n8n.cloud/) and create a free account.
2. Once inside your dashboard, click **"workflows"** on the left menu, then click **"Add workflow"** or **"New"** in the top right.

---

## 📥 Step 2: Import the Workflows
We have created two pre-built workflow files for you:
* [`workflow_deadline.json`](file:///C:/Users/Divina/OneDrive/Desktop/CodeStorm/CampusFlow/workflow_deadline.json) (Workflow 1: Task Deadline reminders)
* [`workflow_notice.json`](file:///C:/Users/Divina/OneDrive/Desktop/CodeStorm/CampusFlow/workflow_notice.json) (Workflow 2: College notice summaries & broadcast)

**How to Import:**
1. Open your new blank workflow in n8n.
2. Click the **three dots (...)** in the top right corner.
3. Select **"Import from File"** and upload `workflow_deadline.json`.
4. Click **"Save"** (Ctrl+S).
5. Repeat this process for the second workflow (Notice Broadcast) in a separate new workflow tab, importing `workflow_notice.json`.

---

## 🔑 Step 3: Connect Google Calendar (OAuth2)
1. Double-click the **Google Calendar** node inside either workflow.
2. In the **Credential for Google Calendar OAuth2 API** dropdown, click **"Create New Credential"**.
3. Under **OAuth Client**, you can use the default n8n OAuth settings. Click **"Sign in with Google"**.
4. Authenticate using your Gmail account. Select **"Allow"** to give n8n permission to manage calendar events.
5. Save the credentials. Both Google Calendar nodes will now be authenticated.

---

## 📱 Step 4: Connect Twilio WhatsApp Sandbox
1. Go to your Twilio Console -> **Messaging** -> **Try it out** -> **Send a WhatsApp Message**.
2. Scan the QR code or send the code (e.g., `join <code-word>`) from your WhatsApp phone to the sandbox number.
3. Copy your **Account SID** and **Auth Token** from your Twilio Console home page.
4. Double-click the **Twilio WhatsApp** node in n8n.
5. In the **Credential for Twilio API** dropdown, select **"Create New Credential"**.
6. Paste your Twilio **Account SID** and **Auth Token**. Save.

---

## 🧪 Step 5: Test the Integration (No Backend Needed!)
We created a lightweight testing suite `test_webhooks.js` that lets you send webhook triggers from your terminal.

1. In n8n, click on your **Webhook** node inside the Deadline workflow.
2. Copy the **Test URL** (looks like `https://<your-n8n-subdomain>.n8n.cloud/webhook-test/deadline`).
3. Open a terminal/powershell inside the `C:\Users\Divina\OneDrive\Desktop\CodeStorm\CampusFlow` folder.
4. Run the test script:
   ```bash
   node test_webhooks.js
   ```
5. Choose **Option 1** (Trigger Deadline) or **Option 2** (Notice Broadcast).
6. Paste the Test Webhook URL when prompted.
7. Fill in the mock inputs (use a real WhatsApp number and a real Gmail address).
8. Verify that n8n executes, showing green checkmarks. Check your Google Calendar and WhatsApp!

---

## 📊 Demo Presentation Tips (For the Pitch)
Judges love visual automation validation. During the demo:
1. Open your n8n dashboard and go to the **Executions** tab on the left sidebar.
2. Show the list of successful runs with green checkmarks.
3. Click into a successful execution to show the data passing through the nodes in real-time.
