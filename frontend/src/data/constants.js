export const CATEGORIES = ["All", "Indian Ethnic Wear", "Indian Western Wear"];
export const LEGACY_WESTERN_CATEGORY = "Indian Premium Western Wear";
export const WESTERN_CATEGORY = "Indian Western Wear";

export const normalizeCategory = (category = "") =>
	category === LEGACY_WESTERN_CATEGORY ? WESTERN_CATEGORY : category;

export const SHIPPING_FREE_THRESHOLD = 2999;
export const SHIPPING_FEE = 99;

export const getShippingCharge = (subtotal) => (subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE);
