export type DiscountCode = {
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number; // percentage (e.g. 10 for 10%) or fixed amount in KES
  description: string;
  minOrder?: number;
};

export const AVAILABLE_DISCOUNTS: DiscountCode[] = [
  {
    code: "ONFITS10",
    type: "percentage",
    value: 10,
    description: "10% off your entire order",
    minOrder: 1000,
  },
  {
    code: "WELCOME",
    type: "percentage",
    value: 15,
    description: "15% off first order for new members",
    minOrder: 2000,
  },
  {
    code: "GOLDVIP",
    type: "fixed",
    value: 500,
    description: "KES 500 off luxury pieces",
    minOrder: 3000,
  },
  {
    code: "FREESHIP",
    type: "free_delivery",
    value: 0,
    description: "Complimentary nationwide delivery",
  },
];

export function applyDiscount(
  codeStr: string,
  subtotal: number,
  standardDeliveryFee: number,
): {
  success: boolean;
  message?: string;
  discountAmount: number;
  newDeliveryFee: number;
  appliedDiscount?: DiscountCode;
} {
  const cleanCode = codeStr.trim().toUpperCase();
  const discount = AVAILABLE_DISCOUNTS.find((d) => d.code === cleanCode);

  if (!discount) {
    return {
      success: false,
      message: "Invalid promo code",
      discountAmount: 0,
      newDeliveryFee: standardDeliveryFee,
    };
  }

  if (discount.minOrder && subtotal < discount.minOrder) {
    return {
      success: false,
      message: `Promo code requires a minimum order of KES ${discount.minOrder.toLocaleString()}`,
      discountAmount: 0,
      newDeliveryFee: standardDeliveryFee,
    };
  }

  let discountAmount = 0;
  let newDeliveryFee = standardDeliveryFee;

  if (discount.type === "percentage") {
    discountAmount = Math.round((subtotal * discount.value) / 100);
  } else if (discount.type === "fixed") {
    discountAmount = Math.min(subtotal, discount.value);
  } else if (discount.type === "free_delivery") {
    newDeliveryFee = 0;
  }

  return {
    success: true,
    message: `${discount.description} applied!`,
    discountAmount,
    newDeliveryFee,
    appliedDiscount: discount,
  };
}
