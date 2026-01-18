# Webhook Integration

How to connect external services to HookFlux.

## GitHub Integration

1. **Create a Flux** in the HookFlux dashboard.
2. Copy the **Webhook Secret** generated for your Flux.
3. Go to your GitHub Repository:
   - **Settings** -> **Webhooks** -> **Add webhook**.
4. **Payload URL**: `https://your-domain.com/api/webhooks/{flux-id}`
   - *You can copy this URL directly from the Flux list in the dashboard.*
5. **Content type**: `application/json`
6. **Secret**: Paste the secret from step 2.
7. **Events**: Select "Just the push event".
8. Click **Add webhook**.

## Generic Webhooks

You can trigger deployments from any system (GitLab, Bitbucket, CI/CD tools, or `curl`).

### Payload Format
HookFlux expects a POST request.

**Headers:**
- `X-Hub-Signature-256`: (Optional but recommended) HMAC-SHA256 signature of the body using your secret.

**Body (JSON):**
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "name": "my-project",
    "clone_url": "https://github.com/user/repo.git"
  }
}
```
*Note: The payload body is accessible in your scripts via the `{{PAYLOAD}}` variable if you need to parse custom data.*

### Manual Trigger (cURL)
```bash
curl -X POST https://your-domain.com/api/webhooks/YOUR_FLUX_ID \
     -H "Content-Type: application/json" \
     -d '{"manual": true}'
```
