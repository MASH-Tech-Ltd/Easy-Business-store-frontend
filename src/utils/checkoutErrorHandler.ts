import { toast } from 'react-toastify';

export function sanitizeErrorMessage(msg: string): string {
  if (!msg) return 'Something went wrong during checkout. Please try again.';

  // Strip Mongo ObjectIds (24-character hexadecimal) and UUIDs from text
  let clean = msg
    .replace(/Product not found or does not belong to this tenant:\s*[a-fA-F0-9]{24}/gi, 'Product not found')
    .replace(/Product out of stock:\s*[a-fA-F0-9]{24}/gi, 'Product out of stock')
    .replace(/[a-fA-F0-9]{24}/gi, '')
    .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    clean.includes('could not verify product prices') ||
    clean.includes('Product not found') ||
    clean.includes('out of stock') ||
    clean.length < 5
  ) {
    return 'Your cart contains products that are unavailable or out of stock. Please review your cart and try again.';
  }

  return clean;
}

export function handleCheckoutError(
  error: any,
  cartItems: any[],
  removeFromCart: (id: string) => void
): string {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';

  const isOutOfStock =
    errorMessage.toLowerCase().includes('out of stock') ||
    errorMessage.toLowerCase().includes('insufficient stock') ||
    errorMessage.toLowerCase().includes('stock');

  // Extract Mongo ObjectId if present in error message
  const match =
    errorMessage.match(/Product (?:not found|out of stock).*?:\s*([a-fA-F0-9]{24})/i) ||
    errorMessage.match(/Product (?:not found|out of stock).*?([a-fA-F0-9]{24})/i) ||
    errorMessage.match(/([a-fA-F0-9]{24})/i);

  if (
    match &&
    match[1] &&
    (errorMessage.includes('Product not found') ||
      errorMessage.includes('prices') ||
      errorMessage.includes('tenant') ||
      isOutOfStock)
  ) {
    const productId = match[1];
    const targetItem = cartItems.find(
      (item) => item.id === productId || (item as any)._id === productId || (item as any).productId === productId
    );

    if (targetItem) {
      removeFromCart(targetItem.id || (targetItem as any)._id);
      const title = targetItem.title || 'Selected item';
      const msg = isOutOfStock
        ? `The item "${title}" is out of stock and has been removed from your cart. Please try placing your order again.`
        : `The item "${title}" is no longer available and has been removed from your cart. Please try placing your order again.`;
      toast.error(msg, { position: 'top-center', autoClose: 6000 });
      return msg;
    } else {
      removeFromCart(productId);
      const msg = isOutOfStock
        ? `An item in your cart is out of stock and has been removed. Please try placing your order again.`
        : `An item in your cart is no longer available and has been removed. Please try placing your order again.`;
      toast.error(msg, { position: 'top-center', autoClose: 6000 });
      return msg;
    }
  }

  if (
    errorMessage.includes('Product not found') ||
    errorMessage.includes('does not belong to this tenant') ||
    errorMessage.includes('could not verify product prices') ||
    isOutOfStock
  ) {
    const msg = isOutOfStock
      ? `Your cart contains items that are out of stock. Please review your cart and try again.`
      : `Your cart contains products that are no longer available in this store. Please review your cart and try again.`;
    toast.error(msg, { position: 'top-center', autoClose: 6000 });
    return msg;
  }

  const cleanMsg = sanitizeErrorMessage(errorMessage);
  toast.error(cleanMsg, { position: 'top-center', autoClose: 6000 });
  return cleanMsg;
}
