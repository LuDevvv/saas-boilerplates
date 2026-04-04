import { BillingService } from "./src";

const billingService = new BillingService("stripe");

async function runTests() {
  console.log("Testing Billing Adapter...\n");

  // Test 1: Create customer
  const customer = await billingService.createCustomer({
    email: "test@example.com",
    name: "Test User",
  });
  console.log("✅ Test 1 - Create Customer:", customer.id);

  // Test 2: Create subscription
  const subscription = await billingService.createSubscription({
    customerId: customer.id,
    planId: "price_monthly",
  });
  console.log("✅ Test 2 - Create Subscription:", subscription.id);

  // Test 3: Get subscription
  const retrievedSubscription = await billingService.getSubscription(
    subscription.id,
  );
  console.log("✅ Test 3 - Get Subscription:", retrievedSubscription.id);

  // Test 4: Cancel subscription
  await billingService.cancelSubscription(subscription.id);
  console.log("✅ Test 4 - Cancel Subscription:", subscription.id);

  // Test 5: Create checkout session
  const checkout = await billingService.createCheckoutSession({
    customerId: customer.id,
    planId: "price_monthly",
    successUrl: "http://localhost:4000/success",
    cancelUrl: "http://localhost:4000/cancel",
  });
  console.log("✅ Test 5 - Create Checkout:", checkout.url);

  // Test 6: Handle webhook
  const webhookEvent = await billingService.handleWebhook({
    type: "payment.succeeded",
    data: { amount: 999 },
  });
  console.log("✅ Test 6 - Handle Webhook:", webhookEvent.id);

  console.log("\n✅ All billing adapter tests completed!");
}

runTests().catch(console.error);
