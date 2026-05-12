const User = require("../models/user.model");

let stripe = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

exports.createCheckout = async (req, res) => {
  try {
    const s = getStripe();
    if (!s) {
      return res.status(503).json({ message: "Payment service not configured" });
    }

    const user = await User.findById(req.user.id);
    if (user.tier === "premium") {
      return res.status(400).json({ message: "Already on Premium" });
    }

    const session = await s.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      metadata: { userId: user._id.toString() },
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Finance Manager Premium",
              description: "AI Assistant, unlimited budgets, advanced analytics",
            },
            unit_amount: 29900, // ₹299/month
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/?upgraded=true`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.webhook = async (req, res) => {
  const s = getStripe();
  if (!s) return res.status(200).send("ok");

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = s.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        tier: "premium",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await User.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      { tier: "free", stripeSubscriptionId: null }
    );
  }

  res.json({ received: true });
};

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("tier stripeSubscriptionId");
    res.json({
      success: true,
      data: {
        tier: user.tier,
        isPremium: user.tier === "premium",
        subscriptionId: user.stripeSubscriptionId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
