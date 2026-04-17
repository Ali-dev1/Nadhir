interface WhatsAppContext {
  page: string;
  productName?: string;
  productPrice?: number;
  orderId?: string;
  customMessage?: string;
}

export const getWhatsAppUrl = (phoneNumber: string, context: WhatsAppContext) => {
  let message = '';

  switch (context.page) {
    case 'product':
      message = `Hi Nadhir, I'm interested in the *${context.productName}* (${context.productPrice ? `KES ${context.productPrice.toLocaleString()}` : 'Price on request'}). Could you provide more details? 🐪`;
      break;
    case 'checkout':
      message = "Hi Nadhir, I'm currently at the checkout and need some assistance with my order. 💳";
      break;
    case 'order-confirmation':
      message = `Hi Nadhir, I just placed order *#${context.orderId?.split('-')[0].toUpperCase()}*! What are the next steps for delivery? 🚚`;
      break;
    case 'account':
      message = "Hi Nadhir, I need help with my account or tracking a previous order. 👤";
      break;
    case 'collections':
      message = "Hi Nadhir, I'm browsing the collections and would love some recommendations for a specific occasion. ✨";
      break;
    default:
      message = context.customMessage || "Hi Nadhir, I'm looking for high-quality Kanzus and fragrances. How can you help me today? 🐪";
  }

  const encodedMsg = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/\+/g, '').replace(/\s/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
};
