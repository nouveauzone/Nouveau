const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveShippingProfile } = require("../config/shippingConfig");

test("returns the United Kingdom shipping profile", () => {
  const profile = resolveShippingProfile("United Kingdom", "INR");
  assert.equal(profile.shippingCountry, "United Kingdom");
  assert.equal(profile.shippingCurrency, "GBP");
  assert.equal(profile.shippingCharge, 35);
});

test("returns the Europe shipping profile for a supported country", () => {
  const profile = resolveShippingProfile("Germany", "INR");
  assert.equal(profile.shippingCountry, "Germany");
  assert.equal(profile.shippingCurrency, "EUR");
  assert.equal(profile.shippingCharge, 80);
});

test("returns a zero-charge profile for unsupported countries", () => {
  const profile = resolveShippingProfile("Japan", "INR");
  assert.equal(profile.shippingCountry, "Japan");
  assert.equal(profile.shippingCurrency, "");
  assert.equal(profile.shippingCharge, 0);
});
