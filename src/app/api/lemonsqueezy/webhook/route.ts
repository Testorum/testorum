import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy';
import {
  isEventProcessed,
  markEventProcessed,
  handleOrderCreated,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handlePaymentSuccess,
  handleSubscriptionExpired,
} from '@/lib/webhook-handlers';

// Disable body parsing — we need the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty body' },
        { status: 400 }
      );
    }

    // 2. Verify signature
    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const isValid = await verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Parse payload
    const payload = JSON.parse(rawBody);
    const eventName: string = payload.meta?.event_name ?? '';
    const eventId: string = payload.meta?.webhook_id ?? payload.data?.id ?? '';

    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // 4. Idempotency check
    const compositeId = `${eventName}:${eventId}`;
    if (await isEventProcessed(compositeId)) {
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // 5. Route to handler
    const { data, meta } = payload;
    const attrs = data?.attributes ?? {};

    // Merge meta + attributes for handlers that need both
    const handlerData = { ...attrs, id: data?.id };
    const handlerMeta = meta ?? {};

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated({ ...handlerData, meta: handlerMeta });
        break;

      case 'subscription_created':
        await handleSubscriptionCreated(handlerData, handlerMeta);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(handlerData, handlerMeta);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(handlerData, handlerMeta);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(handlerData, handlerMeta);
        break;

      default:
        console.warn(`[webhook] Unhandled event: ${eventName}`);
    }

    // 6. Mark processed
    await markEventProcessed(compositeId, eventName);

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('[webhook] Unhandled error:', error);
    // Return 200 to prevent LS from retrying on our bugs
    // (log the error and investigate manually)
    return NextResponse.json(
      { error: 'Internal error (logged)' },
      { status: 200 }
    );
  }
}
