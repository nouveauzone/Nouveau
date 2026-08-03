const DEFAULT_UPI_ID = "amdtrendzz@kotak";

export const BUSINESS_UPI_ID = String(process.env.REACT_APP_UPI_ID || DEFAULT_UPI_ID)
  .trim()
  .toLowerCase();

export const isValidUpiId = (value) => {
  const candidate = String(value || "").trim();
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(candidate);
};
