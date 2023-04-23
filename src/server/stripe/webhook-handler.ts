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

export const handleCheckoutComplete = async ({
  event,
  stripe,
  prisma,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  prisma: PrismaClient;
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const checkoutSessionId: string = event.data.object.id as string;
  const checkoutSession = await stripe.checkout.sessions.retrieve(
    checkoutSessionId,
    {
      expand: ["line_items"],
    }
  );
  if (
    !checkoutSession.line_items ||
    !checkoutSession.line_items.data[0] ||
    !checkoutSession.metadata ||
    !checkoutSession.metadata.userId
  ) {
    return;
  }
  const productId = checkoutSession.line_items.data[0].price?.product;
  const product = await stripe.products.retrieve(productId as string);
  const userId = checkoutSession.metadata.userId;

  if (!product) {
    return;
  }

  if (product.id !== env.PREMIUM_PLAN_ID) {
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      premium: true,
    },
  });
};
