import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { env } from "~/env.mjs";

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const getOrCreateStripeCustomerIdForUser = async ({
  stripe,
  prisma,
  userId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal user id
    metadata: {
      userId,
    },
  });

  // update with new customer id
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  if (updatedUser.stripeCustomerId) {
    return updatedUser.stripeCustomerId;
  }
};

export const handlePaymentIntentSuccess = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  const invoice = event.data.object as Stripe.Invoice;
  if (!invoice.lines || !invoice.lines.data[0]) return;
  const product = invoice.lines.data[0];
  const userId = product.metadata?.userId;

  if (product.id !== env.PREMIUM_PLAN_ID) {
    console.log("Not a premium subscription");
    console.log(product.id);
    console.log(product);
    return;
  }
  // update user with subscription data
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      premium: true,
    },
  });
};
