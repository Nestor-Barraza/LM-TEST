import sql from './db';

export interface CreateProductParams {
  id: string;
  seller_id: string;
  category_id?: string;
  title: string;
  description?: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  original_price?: number;
  currency?: string;
  available_quantity?: number;
  brand?: string;
  model?: string;
  warranty_info?: string;
}

export async function createProduct(params: CreateProductParams) {
  const result = await sql`
    INSERT INTO products ${sql(params)}
    RETURNING *
  `;
  return result[0];
}

export async function getProductById(id: string) {
  const result = await sql`
    SELECT * FROM product_summary
    WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function getProductsByCategory(categorySlug: string, limit = 20, offset = 0) {
  return await sql`
    SELECT p.* FROM product_summary p
    WHERE p.category_slug = ${categorySlug}
    AND p.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  return await sql`
    SELECT * FROM product_summary
    WHERE
      to_tsvector('spanish', title) @@ plainto_tsquery('spanish', ${query})
      OR to_tsvector('spanish', description) @@ plainto_tsquery('spanish', ${query})
      AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function getFeaturedProducts(limit = 10) {
  return await sql`
    SELECT * FROM product_summary
    WHERE featured = TRUE AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function updateProductQuantity(productId: string, quantityChange: number) {
  const result = await sql`
    UPDATE products
    SET
      available_quantity = available_quantity + ${quantityChange},
      sold_quantity = sold_quantity - ${quantityChange}
    WHERE id = ${productId}
    RETURNING *
  `;
  return result[0];
}

export interface CreateProductImageParams {
  product_id: string;
  url: string;
  storage_key?: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
}

export async function addProductImage(params: CreateProductImageParams) {
  const result = await sql`
    INSERT INTO product_images ${sql(params)}
    RETURNING *
  `;
  return result[0];
}

export async function getProductImages(productId: string) {
  return await sql`
    SELECT * FROM product_images
    WHERE product_id = ${productId}
    ORDER BY display_order ASC, created_at ASC
  `;
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await sql.begin(async (tx) => {
    await tx`
      UPDATE product_images
      SET is_primary = FALSE
      WHERE product_id = ${productId}
    `;

    await tx`
      UPDATE product_images
      SET is_primary = TRUE
      WHERE id = ${imageId}
    `;
  });
}

export async function getAllCategories() {
  return await sql`
    SELECT * FROM categories
    WHERE parent_id IS NULL
    ORDER BY name ASC
  `;
}

export async function getCategoryBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM categories
    WHERE slug = ${slug}
  `;
  return result[0] || null;
}

export async function getCategoryWithChildren(slug: string) {
  const category = await sql`
    SELECT * FROM categories
    WHERE slug = ${slug}
  `;

  if (!category[0]) return null;

  const children = await sql`
    SELECT * FROM categories
    WHERE parent_id = ${category[0].id}
    ORDER BY name ASC
  `;

  return {
    ...category[0],
    children,
  };
}

export interface CreateReviewParams {
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase?: boolean;
}

export async function createReview(params: CreateReviewParams) {
  const result = await sql`
    INSERT INTO reviews ${sql(params)}
    RETURNING *
  `;
  return result[0];
}

export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  return await sql`
    SELECT
      r.*,
      u.username,
      u.full_name,
      u.avatar_url
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ${productId}
    ORDER BY r.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function getProductRatingStats(productId: string) {
  const stats = await sql`
    SELECT
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
    FROM reviews
    WHERE product_id = ${productId}
  `;
  return stats[0];
}

export interface CreateUserParams {
  email: string;
  username: string;
  full_name?: string;
  role?: 'buyer' | 'seller' | 'admin';
}

export async function createUser(params: CreateUserParams) {
  const result = await sql`
    INSERT INTO users ${sql(params)}
    RETURNING *
  `;
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users
    WHERE email = ${email}
  `;
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users
    WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function createOrder(params: {
  order_number: string;
  buyer_id: string;
  shipping_address_id?: string | null;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  items: Array<{
    product_id: string;
    seller_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}) {
  return await sql.begin(async (tx) => {
    const order = await tx`
      INSERT INTO orders (
        order_number,
        buyer_id,
        shipping_address_id,
        subtotal,
        shipping_cost,
        tax,
        total
      ) VALUES (
        ${params.order_number},
        ${params.buyer_id},
        ${params.shipping_address_id ?? null},
        ${params.subtotal},
        ${params.shipping_cost},
        ${params.tax},
        ${params.total}
      )
      RETURNING *
    `;

    if (!order[0]) {
      throw new Error('Failed to create order');
    }

    for (const item of params.items) {
      await tx`
        INSERT INTO order_items ${tx({
          ...item,
          order_id: order[0].id,
        })}
      `;

      await tx`
        UPDATE products
        SET
          available_quantity = available_quantity - ${item.quantity},
          sold_quantity = sold_quantity + ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    return order[0];
  });
}

export async function getOrdersByUser(userId: string, limit = 20, offset = 0) {
  return await sql`
    SELECT * FROM orders
    WHERE buyer_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function getOrderDetails(orderId: string) {
  const order = await sql`
    SELECT
      o.*,
      a.street_address,
      a.city,
      a.state,
      a.postal_code,
      a.country
    FROM orders o
    LEFT JOIN addresses a ON o.shipping_address_id = a.id
    WHERE o.id = ${orderId}
  `;

  if (!order[0]) return null;

  const items = await sql`
    SELECT
      oi.*,
      p.title as product_title,
      p.condition,
      u.username as seller_username
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN users u ON oi.seller_id = u.id
    WHERE oi.order_id = ${orderId}
  `;

  return {
    ...order[0],
    items,
  };
}

export async function addToFavorites(userId: string, productId: string) {
  const result = await sql`
    INSERT INTO favorites (user_id, product_id)
    VALUES (${userId}, ${productId})
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING *
  `;
  return result[0];
}

export async function removeFromFavorites(userId: string, productId: string) {
  await sql`
    DELETE FROM favorites
    WHERE user_id = ${userId} AND product_id = ${productId}
  `;
}

export async function getUserFavorites(userId: string, limit = 20, offset = 0) {
  return await sql`
    SELECT
      f.created_at as favorited_at,
      p.*
    FROM favorites f
    JOIN product_summary p ON f.product_id = p.id
    WHERE f.user_id = ${userId}
    ORDER BY f.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function isProductFavorited(userId: string, productId: string) {
  const result = await sql`
    SELECT id FROM favorites
    WHERE user_id = ${userId} AND product_id = ${productId}
  `;
  return result.length > 0;
}

export async function getProductStats(productId: string) {
  const stats = await sql`
    SELECT
      p.id,
      p.title,
      p.sold_quantity,
      p.available_quantity,
      COUNT(DISTINCT r.id) as review_count,
      AVG(r.rating) as average_rating,
      COUNT(DISTINCT f.id) as favorite_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    LEFT JOIN favorites f ON p.id = f.product_id
    WHERE p.id = ${productId}
    GROUP BY p.id, p.title, p.sold_quantity, p.available_quantity
  `;
  return stats[0];
}

export async function getSellerStats(sellerId: string) {
  const stats = await sql`
    SELECT
      COUNT(DISTINCT p.id) as total_products,
      COUNT(DISTINCT CASE WHEN p.is_active = TRUE THEN p.id END) as active_products,
      SUM(p.sold_quantity) as total_sales,
      COUNT(DISTINCT r.id) as total_reviews,
      AVG(r.rating) as average_rating
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.seller_id = ${sellerId}
  `;
  return stats[0];
}
