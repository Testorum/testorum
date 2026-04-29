# LemonSqueezy Dashboard Setup Guide — Testorum

## Step 1: Account & Store

1. Go to https://lemonsqueezy.com → Sign up (or log in)
2. Toggle **Test Mode** ON (top-right switch in dashboard)
3. Go to **Settings → Store**
   - Store Name: `Testorum`
   - Currency: `USD`
   - Save

## Step 2: Create Products

### Product 1 — Testorum Pro

1. Go to **Products → + New Product**
2. Name: `Testorum Pro`
3. Description: `Ad-free experience with deep analysis and HD result cards`
4. **Variant 1** (default):
   - Name: `Monthly`
   - Price: `$4.99`
   - Payment type: `Subscription`
   - Billing period: `Monthly`
   - Save variant
5. **+ Add Variant**:
   - Name: `Yearly`
   - Price: `$39.99`
   - Payment type: `Subscription`
   - Billing period: `Yearly`
   - Save variant
6. Publish product
7. **Record both Variant IDs** (visible in URL or variant detail page)

### Product 2 — Testorum Creator

1. **+ New Product**
2. Name: `Testorum Creator`
3. Description: `Everything in Pro plus Test Builder tools`
4. Variant 1: Monthly → `$9.99` / Subscription / Monthly
5. Variant 2: Yearly → `$89.99` / Subscription / Yearly
6. Publish → Record Variant IDs

### Product 3 — Testorum Business

1. **+ New Product**
2. Name: `Testorum Business`
3. Description: `Full platform access with API and white-label`
4. Variant 1: Monthly → `$29.99` / Subscription / Monthly
5. Publish → Record Variant ID

### Product 4 — Credit Pack (50 Credits)

1. **+ New Product**
2. Name: `Credit Pack — 50 Credits`
3. Description: `One-time purchase of 50 credits for premium features`
4. Variant 1:
   - Name: `50 Credits`
   - Price: `$1.99`
   - Payment type: **Single payment** (NOT subscription)
5. Publish → Record Variant ID

## Step 3: Webhook Configuration

1. Go to **Settings → Webhooks → + Add Endpoint**
2. Callback URL:
   - Production: `https://testorum.app/api/lemonsqueezy/webhook`
   - Development: use ngrok → `https://<your-ngrok>.ngrok-free.app/api/lemonsqueezy/webhook`
3. Signing Secret: Generate a random 40-character string
   - Example generation: `openssl rand -hex 20`
   - Save this as `LEMONSQUEEZY_WEBHOOK_SECRET` in .env.local
4. Select these events:
   - ✅ order_created
   - ✅ subscription_created
   - ✅ subscription_updated
   - ✅ subscription_payment_success
   - ✅ subscription_expired
5. Save webhook

## Step 4: API Key

1. Go to **Settings → API**
2. Click **+ Create API Key**
3. Name: `testorum-server`
4. Copy the key immediately (shown only once)
5. Save as `LEMONSQUEEZY_API_KEY` in .env.local

## Step 5: Record Store ID

1. Go to **Settings → Stores**
2. Your Store ID is visible in the URL or store details
3. Save as `LEMONSQUEEZY_STORE_ID` in .env.local

## Step 6: Fill .env.local

After completing all steps above:

```env
LEMONSQUEEZY_API_KEY=<from Step 4>
LEMONSQUEEZY_STORE_ID=<from Step 5>
LEMONSQUEEZY_WEBHOOK_SECRET=<from Step 3>
LEMONSQUEEZY_VARIANT_PRO_MONTHLY=<from Product 1 Variant 1>
LEMONSQUEEZY_VARIANT_PRO_YEARLY=<from Product 1 Variant 2>
LEMONSQUEEZY_VARIANT_CREATOR_MONTHLY=<from Product 2 Variant 1>
LEMONSQUEEZY_VARIANT_CREATOR_YEARLY=<from Product 2 Variant 2>
LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY=<from Product 3 Variant 1>
LEMONSQUEEZY_VARIANT_CREDIT_PACK=<from Product 4 Variant 1>
```

## Step 7: Test Mode Verification

1. In LS dashboard (Test Mode ON):
   - Go to Products → verify all 4 products show "Test" badge
   - Go to Webhooks → click "Send test" to verify endpoint responds
2. Keep Test Mode ON until ready for production launch

## Notes

- Variant IDs are integers (e.g. `123456`) — LS assigns them
- Store ID is also an integer
- When switching to Live Mode: create new products with same structure
  → update all VARIANT env vars → update webhook URL
- Customer Portal URLs come from the subscription object at runtime
  (no manual setup needed)
