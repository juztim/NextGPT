import { env } from "~/env.mjs";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/webhook-handler";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: session.user?.id,
      mode: "payment",
      line_items: [
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          price: env.PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}?checkoutSuccess=true`,
      cancel_url: `${baseUrl}?checkoutCanceled=true`,
      metadata: {
        userId: session.user?.id,
      },
      payment_intent_data: {
        metadata: {
          userId: session.user?.id,
        },
      },
    });

    if (!checkoutSession) {
      throw new Error("Could not create checkout session");
    }

    return { checkoutUrl: checkoutSession.url };
  }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession =
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
});
