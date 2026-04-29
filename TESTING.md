# Testing Checklist

## Prerequisites
- [ ] Clerk account with publishable + secret keys
- [ ] Locus account with API key
- [ ] OpenAI API key
- [ ] NeonDB PostgreSQL

## 1. Auth Flow
1. Run `npm run dev`
2. Visit http://localhost:3000
3. Click "Sign in to start"
4. Sign up/in with Clerk
5. Should redirect to /dashboard

## 2. Create Product Flow
1. After auth, see homepage with product form
2. Enter: "Email course about baking"
3. Select category: "Education"
4. Click "Generate"
5. Fill in builder form
6. Go to Preview
7. Click "Publish"

## 3. Checkout Flow
1. Visit published /p/[slug] page
2. Click "Buy Now — ₦X"
3. Complete payment via Locus/wallet
4. Buyer wallet gets charged USDC to Locus

## 4. Webhook Verification
1. After payment, webhook hits /api/locus/webhook
2. Order status updates to "paid"
3. Success page shows

## Required env vars
```
DATABASE_URL=postgresql://...
LOCUS_API_KEY=claw_...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Note on Payouts
Set up payout wallet in Locus dashboard - payments go there minus fees.