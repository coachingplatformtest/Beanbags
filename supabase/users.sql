-- Insert all league members with 100 units each
-- Safe to run: uses ON CONFLICT DO NOTHING so won't duplicate if run again

INSERT INTO users (name, units_remaining, units_wagered, units_won, units_lost)
VALUES
  ('Cole',   100.00, 0, 0, 0),
  ('Cory',   100.00, 0, 0, 0),
  ('Gavin',  100.00, 0, 0, 0),
  ('Hunt',   100.00, 0, 0, 0),
  ('Adkins', 100.00, 0, 0, 0),
  ('Major',  100.00, 0, 0, 0),
  ('Nate',   100.00, 0, 0, 0),
  ('Ray',    100.00, 0, 0, 0),
  ('Scotty', 100.00, 0, 0, 0)
ON CONFLICT (name) DO NOTHING;
