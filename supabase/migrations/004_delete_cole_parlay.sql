-- Migration 004: Delete Cole's Maudlin passing yards/TDs parlay + restore his units
-- Run in Supabase SQL Editor

DO $$
DECLARE
  v_cole_id     UUID;
  v_parlay_id   UUID;
  v_wagered     NUMERIC;
BEGIN
  SELECT id INTO v_cole_id FROM users WHERE LOWER(name) = 'cole';

  -- Find the parlay that has BOTH: Maudlin passing yards over AND passing TDs under
  SELECT pb.id, pb.units_wagered
    INTO v_parlay_id, v_wagered
  FROM parlay_bets pb
  WHERE pb.user_id = v_cole_id
    AND pb.status = 'pending'
    AND EXISTS (
      SELECT 1 FROM parlay_legs pl
      WHERE pl.parlay_id = pb.id
        AND pl.selection ILIKE '%Mauldin%Passing Yards%'
    )
    AND EXISTS (
      SELECT 1 FROM parlay_legs pl
      WHERE pl.parlay_id = pb.id
        AND pl.selection ILIKE '%Mauldin%Passing TDs%'
    )
  LIMIT 1;

  IF v_parlay_id IS NOT NULL THEN
    -- Delete legs first (FK constraint)
    DELETE FROM parlay_legs WHERE parlay_id = v_parlay_id;
    -- Delete the parlay
    DELETE FROM parlay_bets WHERE id = v_parlay_id;
    -- Restore Cole's units
    UPDATE users
    SET
      units_remaining = units_remaining + v_wagered,
      units_wagered   = GREATEST(0, units_wagered - v_wagered)
    WHERE id = v_cole_id;

    RAISE NOTICE 'Deleted parlay % (% units restored to Cole)', v_parlay_id, v_wagered;
  ELSE
    RAISE NOTICE 'No matching parlay found for Cole';
  END IF;
END $$;
