'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { getDeliveryPrice } from '@/components/mobile/lib/libya-delivery-data';
import { useShallow } from 'zustand/react/shallow';
import dynamic from 'next/dynamic';

// Lazy load CheckoutDialog — it's heavy (Select, framer-motion, many icons) and only needed when user clicks checkout
const CheckoutDialog = dynamic(() => import('./checkout-dialog').then(m => ({ default: m.CheckoutDialog })), { ssr: false });

export function CartSheet() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction })));
  const isAr = language === 'ar';
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const isLoggedIn = useUIStore((s) => s.isLoggedIn);
  const currentUser = useUIStore((s) => s.currentUser);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Fetch user's default address for delivery fee display
  const [defaultAddress, setDefaultAddress] = useState<{ city: string; area?: string } | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          const defAddr = data.addresses.find((a: { isDefault: boolean }) => a.isDefault) || data.addresses[0];
          setDefaultAddress({ city: defAddr.city, area: defAddr.area });
        }
      })
      .catch(() => {});
  }, [isLoggedIn, currentUser?.id]);

  const deliveryFee = useMemo(() => {
    if (defaultAddress) return getDeliveryPrice(defaultAddress.city, defaultAddress.area || '');
    return 0;
  }, [defaultAddress]);

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const currency = t('product.currency');

  // Sheet slides from left in RTL, right in LTR
  const sheetSide = direction === 'rtl' ? 'left' : 'right';

  const handleCheckout = () => {
    closeCart();
    setCheckoutOpen(true);
  };

  const getItemName = (item: (typeof items)[0]) =>
    language === 'ar' ? item.nameAr : item.nameEn;

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent side={sheetSide} className="w-full sm:max-w-md flex flex-col p-0">
          {/* Header */}
          <SheetHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-nabdh-primary" />
                <SheetTitle className="text-lg">{t('cart.title')}</SheetTitle>
                {totalItems > 0 && (
                  <Badge className="nabdh-gradient text-white text-xs px-2">
                    {totalItems}
                  </Badge>
                )}
              </div>
            </div>
            <SheetDescription className="sr-only">
              {t('cart.title')}
            </SheetDescription>
          </SheetHeader>

          {/* Delivery Note */}
          {items.length > 0 && (
            <div className="px-4 pb-3">
              <div className="glass-card rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="size-3.5 text-nabdh-accent" />
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'رسوم التوصيل تُحتسب عند الدفع حسب المنطقة' : 'Delivery fee calculated at checkout based on your area'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center">
                  <ShoppingBag className="size-10 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-muted-foreground">
                    {t('cart.empty')}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {t('cart.emptyMessage')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card rounded-lg p-3 flex gap-3"
                    >
                      {/* Item Image Placeholder */}
                      <div className="size-16 rounded-md bg-gradient-to-br from-nabdh-primary/20 to-nabdh-accent/20 flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={getItemName(item)}
                            className="size-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-lg font-bold text-nabdh-primary/60">
                            {getItemName(item).charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {getItemName(item)}
                        </h4>
                        <p className="text-sm font-semibold text-nabdh-price mt-0.5">
                          {item.price.toFixed(2)} {currency}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Cart Footer / Summary */}
          {items.length > 0 && (
            <SheetFooter className="p-4 pt-2 border-t space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">
                  {subtotal.toFixed(2)} {currency}
                </span>
              </div>

              {/* Delivery note */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck size={12} className="text-nabdh-accent" />
                  {t('cart.delivery')}
                </span>
                {defaultAddress ? (
                  <span className="text-sm font-medium text-foreground">
                    {deliveryFee.toFixed(2)} {currency}
                  </span>
                ) : (
                  <span className="text-xs text-nabdh-accent font-medium">
                    {language === 'ar' ? 'اختر مدينتك' : 'Choose your city'}
                  </span>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="font-bold text-xl text-nabdh-price">
                  {(subtotal + deliveryFee).toFixed(2)} {currency}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full nabdh-gradient text-white hover:opacity-90 transition-opacity"
                onClick={handleCheckout}
              >
                {t('cart.checkout')}
              </Button>

              {/* Clear Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                <Trash2 className="size-3.5" />
                {t('cart.clear')}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
