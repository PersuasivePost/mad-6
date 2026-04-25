-- Mock data: 2 stalls, 3-4 menu items each

INSERT INTO stalls (name, description, image_url, is_open, prep_time)
VALUES
  ('Spice Corner', 'Indian snacks & meals', NULL, TRUE, '10-15 min'),
  ('Green Bowl', 'Salads, wraps & healthy bowls', NULL, TRUE, '8-12 min')
ON CONFLICT DO NOTHING;

-- Ensure deterministic IDs for local testing by selecting inserted rows
-- If you already have data, you may want to TRUNCATE tables first.

-- Menu items for stall 1 (Spice Corner)
INSERT INTO menu_items (stall_id, name, price, category, is_available, veg_nonveg)
VALUES
  (1, 'Masala Dosa', 80, 'South Indian', TRUE, 'veg'),
  (1, 'Paneer Tikka Roll', 120, 'Rolls', TRUE, 'veg'),
  (1, 'Chicken Biryani', 180, 'Rice', TRUE, 'nonveg'),
  (1, 'Samosa (2 pcs)', 40, 'Snacks', TRUE, 'veg')
ON CONFLICT DO NOTHING;

-- Menu items for stall 2 (Green Bowl)
INSERT INTO menu_items (stall_id, name, price, category, is_available, veg_nonveg)
VALUES
  (2, 'Veggie Salad Bowl', 140, 'Bowls', TRUE, 'veg'),
  (2, 'Grilled Chicken Wrap', 160, 'Wraps', TRUE, 'nonveg'),
  (2, 'Hummus & Pita', 90, 'Snacks', TRUE, 'veg')
ON CONFLICT DO NOTHING;
