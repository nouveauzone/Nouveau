require('dotenv').config();
const { sendOrderEmail, orderConfirmHTML } = require('../utils/email');

(async () => {
  try {
    const to = process.env.TEST_EMAIL_TO || process.env.EMAIL_USER;
    if (!to) {
      console.error('No recipient configured. Set TEST_EMAIL_TO or EMAIL_USER in backend/.env');
      process.exit(1);
    }

    const fakeOrder = {
      _id: 'TEST_ORDER_12345',
      items: [
        { title: 'Sample Product', size: 'M', qty: 1, price: 999 },
      ],
      total: 999,
      shippingAddress: {
        name: 'Test User',
        phone: '9999999999',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '400001',
      },
    };

    await sendOrderEmail({
      to,
      subject: 'Test Order Confirmation — Nouveau',
      html: orderConfirmHTML(fakeOrder, { name: 'Test User' }),
    });

    console.log('Test email attempted. Check recipient inbox.');
  } catch (err) {
    console.error('Test email failed:', err.message || err);
  }
})();
