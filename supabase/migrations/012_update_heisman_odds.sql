-- Migration 012: Update Heisman odds after Week 3 games
-- Run in Supabase SQL Editor

UPDATE futures
SET odds = '+275', odds_numeric = 275
WHERE category = 'heisman' AND selection_name ILIKE '%Matt Brooks%';

UPDATE futures
SET odds = '+325', odds_numeric = 325
WHERE category = 'heisman' AND selection_name ILIKE '%Nick Moncrief%';

UPDATE futures
SET odds = '+350', odds_numeric = 350
WHERE category = 'heisman' AND selection_name ILIKE '%Rhemontae Juggs%';

UPDATE futures
SET odds = '+375', odds_numeric = 375
WHERE category = 'heisman' AND selection_name ILIKE '%Zay Goings%';

UPDATE futures
SET odds = '+450', odds_numeric = 450
WHERE category = 'heisman' AND selection_name ILIKE '%Peter Mauldin%';

UPDATE futures
SET odds = '+700', odds_numeric = 700
WHERE category = 'heisman' AND selection_name ILIKE '%Emanuel Watkins%';

UPDATE futures
SET odds = '+800', odds_numeric = 800
WHERE category = 'heisman' AND selection_name ILIKE '%JD N Co%';

UPDATE futures
SET odds = '+900', odds_numeric = 900
WHERE category = 'heisman' AND selection_name ILIKE '%Butta Bontana%';

UPDATE futures
SET odds = '+1000', odds_numeric = 1000
WHERE category = 'heisman' AND selection_name ILIKE '%CJ Childress%';

UPDATE futures
SET odds = '+1800', odds_numeric = 1800
WHERE category = 'heisman' AND selection_name ILIKE '%Martin Louis%';

UPDATE futures
SET odds = '+2500', odds_numeric = 2500
WHERE category = 'heisman' AND selection_name ILIKE '%Big Willy%';

UPDATE futures
SET odds = '+3000', odds_numeric = 3000
WHERE category = 'heisman' AND selection_name ILIKE '%Joey Chavis%';

UPDATE futures
SET odds = '+3500', odds_numeric = 3500
WHERE category = 'heisman' AND selection_name ILIKE '%Victor Ezukanma%';

UPDATE futures
SET odds = '+4000', odds_numeric = 4000
WHERE category = 'heisman' AND selection_name ILIKE '%Gideon Starr%';

UPDATE futures
SET odds = '+4500', odds_numeric = 4500
WHERE category = 'heisman' AND selection_name ILIKE '%Jojo Binkin It%';

UPDATE futures
SET odds = '+6000', odds_numeric = 6000
WHERE category = 'heisman' AND selection_name ILIKE '%Tobias Bishop%';

UPDATE futures
SET odds = '+25000', odds_numeric = 25000
WHERE category = 'heisman' AND selection_name ILIKE '%Larry Awosika%';
