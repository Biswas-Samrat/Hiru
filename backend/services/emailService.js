const { transporter } = require('../config/mailer');

const MAIL_FROM = process.env.MAIL_FROM || '"Hiran\'s Sri Lankan Fusion" <noreply@hiransfusion.co.nz>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samrat.tx@gmail.com';
const RESTAURANT_NAME = "Hiran's Sri Lankan Fusion Taupo NZ";
const WEBSITE_URL = 'https://www.hiransfusion.co.nz';
const RESTAURANT_ADDRESS = '113 Tongariro Street, Taupo 3330, New Zealand';
const FACEBOOK_URL = 'https://www.facebook.com/people/Hirans-Sri-lankan-Fusion-Taupo-Nz/61563695496447/';

// ─── Structured logger ───────────────────────────────────────────────────────
const log = (message, meta = {}) => {
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[email] ${message}${details}`);
};

const logError = (message, error, meta = {}) => {
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.error(`[email] ✗ ${message}: ${error?.message || error}${details}`);
};

// ─── Core send helper ─────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, context = '' }) => {
  log(`Sending email${context ? ` [${context}]` : ''}`, { to, subject });
  try {
    const info = await transporter.sendMail({ from: MAIL_FROM, to, subject, html });
    log(`Email sent successfully${context ? ` [${context}]` : ''}`, {
      to,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logError(`Email delivery failed${context ? ` [${context}]` : ''}`, error, { to, subject });
    throw error;
  }
};

// ─── Base HTML template ───────────────────────────────────────────────────────
const getBaseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fffdf8; color: #1a1a1a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { background-color: #1a1a1a; padding: 30px; text-align: center; border-bottom: 3px solid #b8860b; }
    .header h1 { color: #fffdf8; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; }
    .content { padding: 45px 30px; line-height: 1.6; }
    .footer { background-color: #faf9f7; padding: 25px; text-align: center; border-top: 1px solid #e8e6e1; font-size: 12px; color: #6b7280; }
    .footer a { color: #b8860b; text-decoration: none; font-weight: 600; }
    .button { display: inline-block; background-color: #b8860b; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-weight: bold; border-radius: 4px; margin: 20px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 12px; border-bottom: 1px solid #f0efeb; font-size: 14px; }
    .details-table td.label { font-weight: bold; color: #6b7280; width: 35%; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { background-color: #faf9f7; padding: 10px 12px; text-align: left; font-size: 13px; font-weight: bold; border-bottom: 2px solid #e8e6e1; }
    .items-table td { padding: 12px; border-bottom: 1px solid #f0efeb; font-size: 14px; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #e8e6e1; background-color: #fffdf8; }
  </style>
</head>
<body>
  <div style="background-color: #fffdf8; padding: 20px 0;">
    <div class="container">
      <div class="header">
        <h1 style="color: #fffdf8; font-size: 20px; font-family: Georgia, serif;">HIRAN'S SRI LANKAN FUSION</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; 2026 ${RESTAURANT_NAME}. All rights reserved.</p>
        <p>${RESTAURANT_ADDRESS}</p>
        <p><a href="${WEBSITE_URL}">Visit Our Website</a> | <a href="${FACEBOOK_URL}">Find Us on Facebook</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── Date formatter (NZ timezone) ────────────────────────────────────────────
const formatDateNZ = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Pacific/Auckland',
    });
  } catch (e) {
    return String(dateVal);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING EMAILS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  // ── Booking confirmation → customer ─────────────────────────────────────────
  sendBookingConfirmationToCustomer: async (booking) => {
    const bookingRef = String(booking._id || booking.id || 'N/A').slice(-8).toUpperCase();
    const customerName = booking.customerInfo?.name || booking.name || 'Valued Guest';
    const customerEmail = booking.customerInfo?.email || booking.email;
    const bookingDate = formatDateNZ(booking.date);
    const bookingTime = booking.time || '';
    const guestCount = booking.guests || 0;
    const specialNotes = booking.notes || 'None';

    log('Preparing customer booking confirmation email', {
      bookingRef,
      to: customerEmail,
    });

    if (!customerEmail) {
      log('Skipped customer booking confirmation — no email address', { bookingRef });
      return;
    }

    const title = 'Booking Confirmed';
    const content = `
      <h2 style="color: #b8860b; margin-top: 0; font-family: Georgia, serif;">Hi ${customerName},</h2>
      <p>Thank you for choosing ${RESTAURANT_NAME}! Your table booking has been successfully confirmed. We look forward to welcoming you soon!</p>
      
      <table class="details-table">
        <tr>
          <td class="label">Booking Reference</td>
          <td><strong>#${bookingRef}</strong></td>
        </tr>
        <tr>
          <td class="label">Customer Name</td>
          <td>${customerName}</td>
        </tr>
        <tr>
          <td class="label">Booking Date</td>
          <td>${bookingDate}</td>
        </tr>
        <tr>
          <td class="label">Booking Time</td>
          <td>${bookingTime}</td>
        </tr>
        <tr>
          <td class="label">Party Size</td>
          <td>${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}</td>
        </tr>
        <tr>
          <td class="label">Special Notes</td>
          <td>${specialNotes}</td>
        </tr>
      </table>

      <p>If you need to adjust or cancel your reservation, please contact us directly on 07 281 7206.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${WEBSITE_URL}" class="button">Visit Our Website</a>
      </div>
    `;

    const html = getBaseTemplate(title, content);
    return sendEmail({
      to: customerEmail,
      subject: `Booking Confirmed (#${bookingRef}) — ${RESTAURANT_NAME}`,
      html,
      context: `customer-booking-confirmation:${bookingRef}`,
    });
  },

  // ── Booking notification → admin ─────────────────────────────────────────────
  sendBookingNotificationToAdmin: async (booking) => {
    const bookingRef = String(booking._id || booking.id || 'N/A').slice(-8).toUpperCase();
    const customerName = booking.customerInfo?.name || booking.name || 'Valued Guest';
    const customerEmail = booking.customerInfo?.email || booking.email || 'Not Provided';
    const customerPhone = booking.customerInfo?.phone || booking.phone || 'Not Provided';
    const bookingDate = formatDateNZ(booking.date);
    const bookingTime = booking.time || '';
    const guestCount = booking.guests || 0;
    const specialNotes = booking.notes || 'None';

    log('Preparing admin booking notification email', {
      bookingRef,
      to: ADMIN_EMAIL,
    });

    const title = 'New Table Reservation';
    const content = `
      <h2 style="color: #a73122; margin-top: 0; font-family: Georgia, serif;">New Table Reservation Alert</h2>
      <p>A customer has booked a table. Below are the details:</p>
      
      <table class="details-table">
        <tr>
          <td class="label">Booking Reference</td>
          <td><strong>#${bookingRef}</strong></td>
        </tr>
        <tr>
          <td class="label">Customer Name</td>
          <td>${customerName}</td>
        </tr>
        <tr>
          <td class="label">Customer Email</td>
          <td>${customerEmail}</td>
        </tr>
        <tr>
          <td class="label">Customer Phone</td>
          <td>${customerPhone}</td>
        </tr>
        <tr>
          <td class="label">Booking Date</td>
          <td>${bookingDate}</td>
        </tr>
        <tr>
          <td class="label">Booking Time</td>
          <td>${bookingTime}</td>
        </tr>
        <tr>
          <td class="label">Party Size</td>
          <td>${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}</td>
        </tr>
        <tr>
          <td class="label">Special Notes</td>
          <td>${specialNotes}</td>
        </tr>
      </table>
    `;

    const html = getBaseTemplate(title, content);
    return sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Table Reservation — ${customerName} (#${bookingRef})`,
      html,
      context: `admin-booking-notification:${bookingRef}`,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ORDER EMAILS
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Order confirmation → customer ────────────────────────────────────────────
  sendOrderConfirmationToCustomer: async (order) => {
    const orderId = String(order._id || order.id || 'N/A');
    const orderRef = orderId.slice(-8).toUpperCase();
    const customerName = order.customerInfo?.name || 'Customer';
    const customerEmail = order.customerInfo?.email;
    const isPickup = order.customerInfo?.fulfillment === 'pickup';
    const fulfillmentType = isPickup ? 'Collection/Takeaway' : 'Delivery';
    const paymentMethod = order.customerInfo?.paymentMethod === 'online' ? 'Online (Card)' : 'Cash on pickup';

    log('Preparing customer order confirmation email', {
      orderId,
      to: customerEmail,
    });

    if (!customerEmail) {
      log('Skipped customer order confirmation — no email address', { orderId });
      return;
    }

    let itemsHtml = '';
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const name =
          item.itemName ||
          item.name ||
          (item.menuItem && item.menuItem.name) ||
          item.title ||
          item.productName ||
          'Item';
        const qty = item.quantity || 1;
        const price = item.price || item.unitPrice || 0;
        const subtotal = (price * qty).toFixed(2);

        itemsHtml += `
          <tr>
            <td>${name}</td>
            <td style="text-align: center;">${qty}</td>
            <td style="text-align: right;">$${Number(price).toFixed(2)}</td>
            <td style="text-align: right;">$${subtotal}</td>
          </tr>
        `;
      });
    }

    const title = 'Order Confirmed';
    const content = `
      <h2 style="color: #b8860b; margin-top: 0; font-family: Georgia, serif;">Hi ${customerName},</h2>
      <p>Thank you for your order! Your takeaway is being prepared in our kitchen and will be ready shortly.</p>
      
      <div style="background-color: #faf9f7; padding: 15px; border-radius: 4px; border-left: 4px solid #b8860b; margin-bottom: 25px;">
        <strong>Order Reference:</strong> #${orderRef}<br>
        <strong>Order Type:</strong> ${fulfillmentType}<br>
        <strong>Payment:</strong> ${paymentMethod}<br>
        <strong>Fulfillment:</strong> Please collect your takeaway from Hiran's Sri Lankan Fusion.
      </div>

      <h3 style="margin-bottom: 10px; border-bottom: 1px solid #e8e6e1; padding-bottom: 5px; font-family: Georgia, serif;">Your Order Details</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th style="text-align: center; width: 10%;">Qty</th>
            <th style="text-align: right; width: 20%;">Price</th>
            <th style="text-align: right; width: 20%;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3">Grand Total</td>
            <td style="text-align: right;">$${order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</td>
          </tr>
        </tbody>
      </table>

      <p>Need help with your order? Call us on 07 281 7206.</p>
    `;

    const html = getBaseTemplate(title, content);
    return sendEmail({
      to: customerEmail,
      subject: `Order Confirmed (#${orderRef}) — ${RESTAURANT_NAME}`,
      html,
      context: `customer-order-confirmation:${orderId}`,
    });
  },

  // ── Order notification → admin ───────────────────────────────────────────────
  sendOrderNotificationToAdmin: async (order) => {
    const orderId = String(order._id || order.id || 'N/A');
    const orderRef = orderId.slice(-8).toUpperCase();
    const customerName = order.customerInfo?.name || 'Customer';
    const customerEmail = order.customerInfo?.email || 'Not Provided';
    const customerPhone = order.customerInfo?.phone || 'Not Provided';
    const isPickup = order.customerInfo?.fulfillment === 'pickup';
    const fulfillmentType = isPickup ? 'Collection/Takeaway' : 'Delivery';
    const deliveryAddress = order.customerInfo?.address || 'Not Provided';
    const paymentMethod = order.customerInfo?.paymentMethod === 'online' ? 'Online (Card — PAID)' : 'Cash on pickup';

    log('Preparing admin order notification email', {
      orderId,
      to: ADMIN_EMAIL,
    });

    let itemsHtml = '';
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const name =
          item.itemName ||
          item.name ||
          (item.menuItem && item.menuItem.name) ||
          item.title ||
          item.productName ||
          'Item';
        const qty = item.quantity || 1;
        const price = item.price || item.unitPrice || 0;
        const subtotal = (price * qty).toFixed(2);

        itemsHtml += `
          <tr>
            <td>${name}</td>
            <td style="text-align: center;">${qty}</td>
            <td style="text-align: right;">$${Number(price).toFixed(2)}</td>
            <td style="text-align: right;">$${subtotal}</td>
          </tr>
        `;
      });
    }

    const title = 'New Order Received';
    const content = `
      <h2 style="color: #a73122; margin-top: 0; font-family: Georgia, serif;">New Online Order Alert</h2>
      <p>A new order has been placed. Please see details below:</p>
      
      <table class="details-table">
        <tr>
          <td class="label">Order Reference</td>
          <td><strong>#${orderRef}</strong></td>
        </tr>
        <tr>
          <td class="label">Customer Name</td>
          <td>${customerName}</td>
        </tr>
        <tr>
          <td class="label">Customer Email</td>
          <td>${customerEmail}</td>
        </tr>
        <tr>
          <td class="label">Customer Phone</td>
          <td>${customerPhone}</td>
        </tr>
        <tr>
          <td class="label">Order Type</td>
          <td>${fulfillmentType}</td>
        </tr>
        <tr>
          <td class="label">Payment</td>
          <td>${paymentMethod}</td>
        </tr>
        ${!isPickup ? `
        <tr>
          <td class="label">Delivery Address</td>
          <td>${deliveryAddress}</td>
        </tr>
        ` : ''}
      </table>

      <h3 style="margin-bottom: 10px; border-bottom: 1px solid #e8e6e1; padding-bottom: 5px; font-family: Georgia, serif;">Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th style="text-align: center; width: 10%;">Qty</th>
            <th style="text-align: right; width: 20%;">Price</th>
            <th style="text-align: right; width: 20%;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3">Grand Total</td>
            <td style="text-align: right;">$${order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</td>
          </tr>
        </tbody>
      </table>
    `;

    const html = getBaseTemplate(title, content);
    return sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order (#${orderRef}) — ${customerName}`,
      html,
      context: `admin-order-notification:${orderId}`,
    });
  },
};
