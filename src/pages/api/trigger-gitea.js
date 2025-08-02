// pages/api/trigger-gitea.js
export default async function handler(req, res) {
    const { branch, repo } = req.body;
  
    // Gitea webhook endpoint (could be on your self-hosted Gitea or local tunnel for testing)
    // const giteaWebhookUrl = 'https://git.home.medhir.in/kabhishek/ui-new-test'; // Replace as needed
  
    // This is an example payload you’d want Gitea to emit upon push
    // Normally, you trigger a push via git push, but you could simulate via a REST call if Gitea supports such custom webhooks
  
    // If you want Jenkins to receive a POST from your Next.js app directly:
    const jenkinsWebhookUrl = 'http://192.168.0.101:9010/generic-webhook-trigger/invoke?token=test-backend-token';
  
    const payload = {
      branch,
      repo,
      // Add more fields as needed
    };
  
    // Send payload to Jenkins directly (bypassing Gitea in this direct example)
    const response = await fetch(jenkinsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    const result = await response.text();
    return res.status(200).json({ message: "Webhook sent to Jenkins", result });
  }