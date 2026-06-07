import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialise Stripe once — never inside a component to avoid re-instantiation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Inner checkout form — must be a child of <Elements>
// ─────────────────────────────────────────────────────────────────────────────
const CheckoutForm = ({ orderId, totalAmountFormatted, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expressReady, setExpressReady] = useState(false);

  // ── Shared confirm logic used by both Express Checkout and the Pay button ──
  const confirmPayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage('');

    // return_url is required by Stripe for redirect-based methods (some Apple
    // Pay / Link flows). For card payments, redirect: 'if_required' keeps the
    // user on-page and onSuccess is called directly.
    const returnUrl = `${window.location.origin}/order-tracking/${orderId}?success=true`;

    console.log("Calling stripe.confirmPayment");
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required', // stay on-page for cards; redirect only when needed
    });
    console.log("confirmPayment result", result);

    const { error, paymentIntent } = result;

    if (error) {
      // Card errors, validation errors, declines, etc.
      console.error("Stripe payment failed", error);
      const msg = error.message || 'Payment failed. Please check your details and try again.';
      setErrorMessage(msg);
      onError(msg);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Card payment confirmed on-page — webhook will mark the order PAID.
      // We navigate to order tracking which will reflect PAID once webhook fires.
      onSuccess(orderId, { redirect: false });
    } else {
      // Any other status (e.g. requires_action) — Stripe handles it.
      // If we reach here without a redirect it means something unexpected happened.
      setLoading(false);
    }
  };

  // ── Express Checkout (Apple Pay / Google Pay / Link wallet) ───────────────
  const handleExpressConfirm = async () => {
    console.log("Submitting Stripe payment");
    await confirmPayment();
  };

  // ── Standard Pay button ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("Submitting Stripe payment");
    await confirmPayment();
  };

  return (
    <div className="space-y-4" id="stripe-checkout-form">

      {/* Express Checkout — Apple Pay, Google Pay, Link (shown only when available) */}
      <div>
        <ExpressCheckoutElement
          onConfirm={handleExpressConfirm}
          onReady={({ availablePaymentMethods }) => {
            // Show divider only when at least one express method is available
            if (availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean)) {
              setExpressReady(true);
            }
          }}
          options={{
            buttonType: { applePay: 'buy', googlePay: 'buy' },
            layout: { maxColumns: 2, maxRows: 1 },
          }}
        />
        {/* Divider between Express and card form — only shown when express is available */}
        {expressReady && (
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or pay by card</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        )}
      </div>

      {/* Standard card / payment fields */}
      <PaymentElement
        options={{
          layout: 'tabs',
          // Express methods already shown above — hide them from the tab list
          // to avoid duplicates. Stripe still shows Link inside the form if it
          // was not shown in the Express row.
          paymentMethodOrder: ['card', 'link'],
        }}
      />

      {/* Inline error message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pay button */}
      <button
        type="button"
        id="stripe-pay-btn"
        onClick={handleSubmit}
        disabled={!stripe || !elements || loading}
        className="w-full cursor-pointer rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <i className="fa-solid fa-spinner fa-spin me-2" aria-hidden="true" />
            Processing payment…
          </>
        ) : (
          <>
            <i className="fa-solid fa-lock me-2" aria-hidden="true" />
            Pay {totalAmountFormatted}
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-gray-400">
        Secured by{' '}
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Stripe
        </a>
        . Your payment details are never stored on our servers.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported wrapper — boots Stripe Elements with the clientSecret + brand theme
// ─────────────────────────────────────────────────────────────────────────────
const StripePaymentForm = ({ clientSecret, orderId, totalAmountFormatted, onSuccess, onError }) => {
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
        <i className="fa-solid fa-spinner fa-spin" />
        <span>Initialising secure payment…</span>
      </div>
    );
  }

  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#f59e0b',        // amber-400 — matches brand
        colorBackground: '#ffffff',
        colorText: '#111827',
        colorDanger: '#ef4444',
        fontFamily: '"Inter", system-ui, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': { boxShadow: 'none', border: '1px solid #e5e7eb' },
        '.Input:focus': { borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' },
        '.Label': { fontWeight: '600', fontSize: '12px' },
        '.Tab': { border: '1px solid #e5e7eb' },
        '.Tab--selected': { borderColor: '#f59e0b', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm
        orderId={orderId}
        totalAmountFormatted={totalAmountFormatted}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripePaymentForm;
