-- ============================================
-- MIGRATION 002: Add sample data for discounts and shipping
-- ============================================

-- Update 30% of products with original_price to show discounts
UPDATE products
SET original_price = ROUND(price * 1.25, 2)
WHERE id IN (
  SELECT id FROM products
  WHERE MOD(CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER), 3) = 0
  LIMIT 20
);

-- Update all shipping options with estimated delivery days
UPDATE shipping_options
SET estimated_delivery_days =
  CASE
    WHEN free_shipping = true THEN FLOOR(RANDOM() * 3 + 3)::INTEGER -- 3-5 days for free shipping
    ELSE FLOOR(RANDOM() * 2 + 1)::INTEGER -- 1-2 days for paid shipping
  END
WHERE estimated_delivery_days IS NULL;

-- Verify the changes
SELECT
  'Products with discounts' as metric,
  COUNT(*) as count
FROM products
WHERE original_price IS NOT NULL
UNION ALL
SELECT
  'Shipping options with delivery days' as metric,
  COUNT(*) as count
FROM shipping_options
WHERE estimated_delivery_days IS NOT NULL;
