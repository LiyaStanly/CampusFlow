const readline = require('readline');

// Default Webhook URLs - Can be overridden by environment variables or CLI input
let DEADLINE_WEBHOOK_URL = process.env.N8N_DEADLINE_WEBHOOK || '';
let NOTICE_WEBHOOK_URL = process.env.N8N_NOTICE_WEBHOOK || '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function sendWebhook(url, payload) {
  if (!url) {
    console.error('\x1b[31mError: Webhook URL is empty. Please set it first!\x1b[0m');
    return;
  }
  console.log(`\n\x1b[36mSending payload to: ${url}...\x1b[0m`);
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const text = await response.text();
      console.log(`\x1b[32m✔ Success! Status: ${response.status} (${response.statusText})\x1b[0m`);
      console.log(`Response: ${text || '(empty response)'}`);
    } else {
      console.error(`\x1b[31m✖ Failed. Status: ${response.status} (${response.statusText})\x1b[0m`);
    }
  } catch (err) {
    console.error(`\x1b[31m✖ Connection Error: ${err.message}\x1b[0m`);
  }
}

async function main() {
  console.log('\n\x1b[35m=== CampusFlow n8n Webhook Tester ===\x1b[0m');
  
  if (!DEADLINE_WEBHOOK_URL) {
    DEADLINE_WEBHOOK_URL = await askQuestion('Enter your n8n DEADLINE Webhook URL (Test/Production): ');
  } else {
    console.log(`Using Deadline Webhook: ${DEADLINE_WEBHOOK_URL}`);
  }

  if (!NOTICE_WEBHOOK_URL) {
    NOTICE_WEBHOOK_URL = await askQuestion('Enter your n8n NOTICE Webhook URL (Test/Production): ');
  } else {
    console.log(`Using Notice Webhook: ${NOTICE_WEBHOOK_URL}`);
  }

  while (true) {
    console.log('\n\x1b[33mSelect a Test Option:\x1b[0m');
    console.log('1. Trigger Workflow 1: Add Deadline (Calendar + 24h WhatsApp reminder)');
    console.log('2. Trigger Workflow 2: Broadcast Notice (AI Summarize + Group WhatsApp)');
    console.log('3. Update Webhook URLs');
    console.log('4. Exit');

    const choice = await askQuestion('\nYour choice (1-4): ');

    if (choice === '1') {
      const title = await askQuestion('Enter Task Title [default: OS Assignment 2]: ') || 'OS Assignment 2';
      const subject = await askQuestion('Enter Subject [default: Operating Systems]: ') || 'Operating Systems';
      const studentName = await askQuestion('Enter Student Name [default: Liya]: ') || 'Liya';
      const phone = await askQuestion('Enter WhatsApp Phone (with country code, e.g., +919876543210): ');
      const email = await askQuestion('Enter Google Account/Email for Calendar: ');

      // Schedule deadline to be 25 hours from now
      const deadlineDate = new Date(Date.now() + 25 * 60 * 60 * 1000);
      // Schedule reminder to be 1 hour from now (24 hours before deadline)
      const reminderDate = new Date(Date.now() + 1 * 60 * 60 * 1000);

      const payload = {
        studentName,
        phone: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`,
        email,
        subject,
        taskTitle: title,
        deadline: deadlineDate.toISOString(),
        reminderTime: reminderDate.toISOString(),
        addToCalendar: true
      };

      await sendWebhook(DEADLINE_WEBHOOK_URL, payload);

    } else if (choice === '2') {
      const noticeText = await askQuestion('Paste Notice Text [or press Enter for default]: ') || 
        'Dear B.Tech students, the mock placements test is scheduled for 28th June 2026 at 10:00 AM. Attendance is mandatory for all branches. Prepare Resume.';
      const eventTitle = await askQuestion('Enter Event Title [default: Placement Mock Test]: ') || 'Placement Mock Test';
      const eventDate = await askQuestion('Enter Event Date (YYYY-MM-DD) [default: 2026-06-28]: ') || '2026-06-28';
      const phoneInput = await askQuestion('Enter phone numbers to broadcast (comma-separated, e.g. +919876543210): ');
      
      const phoneList = phoneInput ? phoneInput.split(',').map(p => p.trim()) : [];

      const payload = {
        noticeText,
        aiSummary: "• Mock placements test scheduled for 28th June 2026, 10:00 AM.\n• Attendance is mandatory for all B.Tech branches.\n• Students must prepare and bring their resumes.",
        eventTitle,
        eventDate,
        phoneList
      };

      await sendWebhook(NOTICE_WEBHOOK_URL, payload);

    } else if (choice === '3') {
      DEADLINE_WEBHOOK_URL = await askQuestion('Enter new n8n DEADLINE Webhook URL: ') || DEADLINE_WEBHOOK_URL;
      NOTICE_WEBHOOK_URL = await askQuestion('Enter new n8n NOTICE Webhook URL: ') || NOTICE_WEBHOOK_URL;
      console.log('\x1b[32mWebhook URLs updated!\x1b[0m');

    } else if (choice === '4') {
      console.log('Goodbye!');
      rl.close();
      break;
    } else {
      console.log('Invalid choice. Please enter 1, 2, 3, or 4.');
    }
  }
}

main().catch(err => {
  console.error('Fatal Error:', err);
  rl.close();
});
