-- ============================================================
-- Fantasy World Cup 2026 - Initial Schema
-- ============================================================

-- Owners table
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  pot_number INTEGER NOT NULL CHECK (pot_number BETWEEN 1 AND 6),
  group_name TEXT NOT NULL,
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_scored - goals_conceded) STORED,
  total_points NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_group ON teams(group_name);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('group','round_of_32','round_of_16','quarterfinal','semifinal','final')),
  group_name TEXT,
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT '',
  home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  home_score INTEGER,
  away_score INTEGER,
  extra_time_or_penalties BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  slot_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_home ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away ON matches(away_team_id);

-- Owner rankings table (updated automatically via trigger)
CREATE TABLE IF NOT EXISTS owner_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES owners(id) ON DELETE CASCADE UNIQUE,
  total_points NUMERIC(10,2) DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_rankings_owner ON owner_rankings(owner_id);

-- Bracket slots table (1-32 for round of 32, etc.)
CREATE TABLE IF NOT EXISTS bracket_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_name TEXT NOT NULL,
  slot_number INTEGER NOT NULL UNIQUE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bracket_slots_round ON bracket_slots(round_name);

-- ============================================================
-- CORE RECALCULATION FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_pot_multiplier(pot_diff INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  CASE pot_diff
    WHEN 1 THEN RETURN 1.2;
    WHEN 2 THEN RETURN 1.4;
    WHEN 3 THEN RETURN 1.6;
    WHEN 4 THEN RETURN 1.8;
    ELSE RETURN 2.0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_match_points(
  p_home_score INTEGER,
  p_away_score INTEGER,
  p_home_pot INTEGER,
  p_away_pot INTEGER,
  p_stage TEXT,
  p_extra_time BOOLEAN,
  OUT home_pts NUMERIC,
  OUT away_pts NUMERIC
) AS $$
DECLARE
  pot_diff INTEGER;
  multiplier NUMERIC;
  lower_pot_team TEXT;
  home_base NUMERIC;
  away_base NUMERIC;
  home_goal_bonus NUMERIC;
  away_goal_bonus NUMERIC;
BEGIN
  pot_diff := ABS(p_home_pot - p_away_pot);
  multiplier := CASE WHEN pot_diff > 0 THEN get_pot_multiplier(pot_diff) ELSE 1.0 END;

  IF p_home_pot > p_away_pot THEN lower_pot_team := 'home';
  ELSIF p_home_pot < p_away_pot THEN lower_pot_team := 'away';
  ELSE lower_pot_team := NULL;
  END IF;

  IF p_stage = 'group' THEN
    IF p_home_score > p_away_score THEN
      home_base := 3; away_base := 0;
    ELSIF p_home_score < p_away_score THEN
      home_base := 0; away_base := 3;
    ELSE
      home_base := 1; away_base := 1;
    END IF;
  ELSE
    IF p_home_score > p_away_score THEN
      home_base := CASE WHEN p_extra_time THEN 2 ELSE 3 END;
      away_base := CASE WHEN p_extra_time THEN 1 ELSE 0 END;
    ELSIF p_home_score < p_away_score THEN
      home_base := CASE WHEN p_extra_time THEN 1 ELSE 0 END;
      away_base := CASE WHEN p_extra_time THEN 2 ELSE 3 END;
    ELSE
      home_base := 0; away_base := 0;
    END IF;
  END IF;

  home_goal_bonus := p_home_score * 0.1;
  away_goal_bonus := p_away_score * 0.1;

  IF lower_pot_team = 'home' AND pot_diff > 0 THEN
    home_pts := ROUND((home_base + home_goal_bonus) * multiplier, 2);
    away_pts := ROUND(away_base + away_goal_bonus, 2);
  ELSIF lower_pot_team = 'away' AND pot_diff > 0 THEN
    home_pts := ROUND(home_base + home_goal_bonus, 2);
    away_pts := ROUND((away_base + away_goal_bonus) * multiplier, 2);
  ELSE
    home_pts := ROUND(home_base + home_goal_bonus, 2);
    away_pts := ROUND(away_base + away_goal_bonus, 2);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION recalculate_all_points()
RETURNS VOID AS $$
DECLARE
  m RECORD;
  home_t RECORD;
  away_t RECORD;
  pts RECORD;
  t RECORD;
  o RECORD;
  bracket_bonus NUMERIC;
BEGIN
  -- Reset all team stats
  UPDATE teams SET goals_scored = 0, goals_conceded = 0, total_points = 0;

  -- Process completed matches
  FOR m IN SELECT * FROM matches WHERE completed = TRUE AND home_score IS NOT NULL AND away_score IS NOT NULL LOOP
    SELECT * INTO home_t FROM teams WHERE id = m.home_team_id;
    SELECT * INTO away_t FROM teams WHERE id = m.away_team_id;

    IF home_t IS NULL OR away_t IS NULL THEN CONTINUE; END IF;

    SELECT * INTO pts FROM calculate_match_points(
      m.home_score, m.away_score,
      home_t.pot_number, away_t.pot_number,
      m.stage, m.extra_time_or_penalties
    );

    UPDATE teams SET
      goals_scored = goals_scored + m.home_score,
      goals_conceded = goals_conceded + m.away_score,
      total_points = total_points + pts.home_pts
    WHERE id = m.home_team_id;

    UPDATE teams SET
      goals_scored = goals_scored + m.away_score,
      goals_conceded = goals_conceded + m.home_score,
      total_points = total_points + pts.away_pts
    WHERE id = m.away_team_id;
  END LOOP;

  -- Add bracket bonus points (+1 per bracket slot appearance)
  FOR t IN SELECT team_id, COUNT(*) as slot_count FROM bracket_slots WHERE team_id IS NOT NULL GROUP BY team_id LOOP
    UPDATE teams SET total_points = total_points + t.slot_count WHERE id = t.team_id;
  END LOOP;

  -- Update owner_rankings
  FOR o IN SELECT id FROM owners LOOP
    SELECT COALESCE(SUM(total_points), 0), COALESCE(SUM(goals_scored - goals_conceded), 0)
    INTO bracket_bonus
    FROM teams WHERE owner_id = o.id;

    INSERT INTO owner_rankings (owner_id, total_points, goal_difference, updated_at)
    SELECT
      o.id,
      COALESCE(SUM(total_points), 0),
      COALESCE(SUM(goals_scored - goals_conceded), 0),
      NOW()
    FROM teams WHERE owner_id = o.id
    ON CONFLICT (owner_id) DO UPDATE SET
      total_points = EXCLUDED.total_points,
      goal_difference = EXCLUDED.goal_difference,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert owners
INSERT INTO owners (name) VALUES
  ('Achal'), ('Aditya'), ('Arun'), ('Ashwin'),
  ('Bikash'), ('Bimal'), ('Biplav'), ('Bishal')
ON CONFLICT (name) DO NOTHING;

-- Insert teams (with owner references)
INSERT INTO teams (team_name, pot_number, group_name, owner_id)
SELECT t.team_name, t.pot_number, t.group_name, o.id
FROM (VALUES
  -- Pot 1
  ('Spain', 1, 'H', 'Achal'),
  ('France', 1, 'I', 'Aditya'),
  ('Argentina', 1, 'J', 'Bikash'),
  ('England', 1, 'L', 'Ashwin'),
  ('Brazil', 1, 'C', 'Arun'),
  ('Portugal', 1, 'K', 'Biplav'),
  ('Netherlands', 1, 'F', 'Bimal'),
  ('Germany', 1, 'E', 'Bishal'),
  -- Pot 2
  ('Croatia', 2, 'L', 'Arun'),
  ('Belgium', 2, 'G', 'Aditya'),
  ('Colombia', 2, 'K', 'Bishal'),
  ('Morocco', 2, 'C', 'Achal'),
  ('Senegal', 2, 'I', 'Biplav'),
  ('Japan', 2, 'F', 'Ashwin'),
  ('Uruguay', 2, 'H', 'Bimal'),
  ('Switzerland', 2, 'B', 'Bikash'),
  -- Pot 3
  ('Mexico', 3, 'A', 'Arun'),
  ('Turkiye', 3, 'D', 'Achal'),
  ('Ecuador', 3, 'E', 'Bikash'),
  ('Norway', 3, 'I', 'Ashwin'),
  ('Austria', 3, 'J', 'Bimal'),
  ('USA', 3, 'D', 'Aditya'),
  ('Iran', 3, 'G', 'Biplav'),
  ('Australia', 3, 'D', 'Bishal'),
  -- Pot 4
  ('South Korea', 4, 'A', 'Bikash'),
  ('Canada', 4, 'B', 'Ashwin'),
  ('Algeria', 4, 'J', 'Aditya'),
  ('Paraguay', 4, 'D', 'Arun'),
  ('Egypt', 4, 'G', 'Bishal'),
  ('Panama', 4, 'L', 'Achal'),
  ('Scotland', 4, 'C', 'Bimal'),
  ('Sweden', 4, 'F', 'Biplav'),
  -- Pot 5
  ('Cote d''Ivoire', 5, 'E', 'Achal'),
  ('Czechia', 5, 'A', 'Biplav'),
  ('Uzbekistan', 5, 'K', 'Bikash'),
  ('DR Congo', 5, 'K', 'Arun'),
  ('Tunisia', 5, 'F', 'Bishal'),
  ('Iraq', 5, 'I', 'Bimal'),
  ('Jordan', 5, 'J', 'Ashwin'),
  ('Saudi Arabia', 5, 'H', 'Aditya'),
  -- Pot 6
  ('South Africa', 6, 'A', 'Achal'),
  ('Qatar', 6, 'B', 'Biplav'),
  ('Bosnia & Herzegovina', 6, 'B', 'Bishal'),
  ('Cape Verde', 6, 'H', 'Bikash'),
  ('Ghana', 6, 'L', 'Bimal'),
  ('New Zealand', 6, 'G', 'Arun'),
  ('Haiti', 6, 'C', 'Aditya'),
  ('Curacao', 6, 'E', 'Ashwin')
) AS t(team_name, pot_number, group_name, owner_name)
JOIN owners o ON o.name = t.owner_name
ON CONFLICT (team_name) DO NOTHING;

-- Insert group stage matches
INSERT INTO matches (stage, group_name, match_date, match_time, venue, home_team_id, away_team_id)
SELECT 'group', gm.group_name, gm.match_date::DATE, gm.match_time, gm.venue, ht.id, at.id
FROM (VALUES
  ('A','2026-06-12','12:45 AM','Mexico City','Mexico','South Africa'),
  ('A','2026-06-12','7:45 AM','Zapopan, Mexico','South Korea','Czechia'),
  ('B','2026-06-13','12:45 AM','Toronto','Canada','Bosnia & Herzegovina'),
  ('D','2026-06-13','6:45 AM','Inglewood, Calif.','USA','Paraguay'),
  ('B','2026-06-14','12:45 AM','Santa Clara, Calif.','Qatar','Switzerland'),
  ('C','2026-06-14','3:45 AM','East Rutherford, New Jersey','Brazil','Morocco'),
  ('C','2026-06-14','6:45 AM','Foxborough, Mass.','Haiti','Scotland'),
  ('D','2026-06-14','9:45 AM','Vancouver, Canada','Australia','Turkiye'),
  ('E','2026-06-14','10:45 PM','Houston','Germany','Curacao'),
  ('F','2026-06-15','1:45 AM','Arlington, Texas','Netherlands','Japan'),
  ('E','2026-06-15','4:45 AM','Philadelphia','Cote d''Ivoire','Ecuador'),
  ('F','2026-06-15','7:45 AM','Guadalupe, Mexico','Sweden','Tunisia'),
  ('H','2026-06-15','9:45 PM','Atlanta','Spain','Cape Verde'),
  ('G','2026-06-16','12:45 AM','Seattle','Belgium','Egypt'),
  ('H','2026-06-16','3:45 AM','Miami Gardens, Fla.','Saudi Arabia','Uruguay'),
  ('G','2026-06-16','6:45 AM','Inglewood, Calif.','Iran','New Zealand'),
  ('I','2026-06-17','12:45 AM','East Rutherford, N.J.','France','Senegal'),
  ('I','2026-06-17','3:45 AM','Foxborough, Mass.','Iraq','Norway'),
  ('J','2026-06-17','6:45 AM','Kansas City, Mo.','Argentina','Algeria'),
  ('J','2026-06-17','9:45 AM','Santa Clara, Calif.','Austria','Jordan'),
  ('K','2026-06-17','10:45 PM','Houston','Portugal','DR Congo'),
  ('L','2026-06-18','1:45 AM','Arlington, Texas','England','Croatia'),
  ('L','2026-06-18','4:45 AM','Toronto','Ghana','Panama'),
  ('K','2026-06-18','7:45 AM','Mexico City','Uzbekistan','Colombia'),
  ('A','2026-06-18','9:45 PM','Atlanta','Czechia','South Africa'),
  ('B','2026-06-19','12:45 AM','Inglewood, Calif.','Switzerland','Bosnia & Herzegovina'),
  ('B','2026-06-19','3:45 AM','Vancouver, Canada','Canada','Qatar'),
  ('A','2026-06-19','6:45 AM','Zapopan, Mexico','Mexico','South Korea'),
  ('D','2026-06-20','12:45 AM','Seattle','USA','Australia'),
  ('C','2026-06-20','3:45 AM','Foxborough, Mass.','Scotland','Morocco'),
  ('C','2026-06-20','6:15 AM','Philadelphia','Brazil','Haiti'),
  ('D','2026-06-20','8:45 AM','Santa Clara, Calif.','Turkiye','Paraguay'),
  ('F','2026-06-20','10:45 PM','Houston','Netherlands','Sweden'),
  ('E','2026-06-21','1:45 AM','Toronto','Germany','Cote d''Ivoire'),
  ('E','2026-06-21','5:45 AM','Kansas City, Mo.','Ecuador','Curacao'),
  ('F','2026-06-21','9:45 AM','Guadalupe, Mexico','Tunisia','Japan'),
  ('H','2026-06-21','9:45 PM','Atlanta','Spain','Saudi Arabia'),
  ('G','2026-06-22','12:45 AM','Inglewood, Calif.','Belgium','Iran'),
  ('H','2026-06-22','3:45 AM','Miami Gardens, Fla.','Uruguay','Cape Verde'),
  ('G','2026-06-22','6:45 AM','Vancouver','New Zealand','Egypt'),
  ('J','2026-06-22','10:45 PM','Arlington, Texas','Argentina','Austria'),
  ('I','2026-06-23','2:45 AM','Philadelphia','France','Iraq'),
  ('I','2026-06-23','5:45 AM','East Rutherford, N.J.','Norway','Senegal'),
  ('J','2026-06-23','8:45 AM','Santa Clara, Calif.','Jordan','Algeria'),
  ('K','2026-06-23','10:45 PM','Houston','Portugal','Uzbekistan'),
  ('L','2026-06-24','1:45 AM','Foxborough, Mass.','England','Ghana'),
  ('L','2026-06-24','4:45 AM','Toronto','Panama','Croatia'),
  ('K','2026-06-24','7:45 AM','Zapopan, Mexico','Colombia','DR Congo'),
  ('B','2026-06-25','12:45 AM','Vancouver, Canada','Switzerland','Canada'),
  ('B','2026-06-25','12:45 AM','Seattle','Bosnia & Herzegovina','Qatar'),
  ('C','2026-06-25','3:45 AM','Miami Gardens, Fla.','Scotland','Brazil'),
  ('C','2026-06-25','3:45 AM','Atlanta','Morocco','Haiti'),
  ('A','2026-06-25','6:45 AM','Mexico City','Czechia','Mexico'),
  ('A','2026-06-25','6:45 AM','Guadalupe, Mexico','South Africa','South Korea'),
  ('E','2026-06-26','1:45 AM','East Rutherford, N.J.','Ecuador','Germany'),
  ('E','2026-06-26','1:45 AM','Philadelphia','Curacao','Cote d''Ivoire'),
  ('F','2026-06-26','4:45 AM','Arlington, Texas','Japan','Sweden'),
  ('F','2026-06-26','4:45 AM','Kansas City, Mo.','Tunisia','Netherlands'),
  ('D','2026-06-26','7:45 AM','Inglewood, Calif.','Turkiye','USA'),
  ('D','2026-06-26','7:45 AM','Santa Clara, Calif.','Paraguay','Australia'),
  ('I','2026-06-27','12:45 AM','Foxborough, Mass.','Norway','France'),
  ('I','2026-06-27','12:45 AM','Toronto','Senegal','Iraq'),
  ('H','2026-06-27','5:45 AM','Houston','Cape Verde','Saudi Arabia'),
  ('H','2026-06-27','5:45 AM','Zapopan, Mexico','Uruguay','Spain'),
  ('G','2026-06-27','8:45 AM','Seattle','Egypt','Iran'),
  ('G','2026-06-27','8:45 AM','Vancouver, Canada','New Zealand','Belgium'),
  ('L','2026-06-28','2:45 AM','East Rutherford, N.J.','Panama','England'),
  ('L','2026-06-28','2:45 AM','Philadelphia','Croatia','Ghana'),
  ('K','2026-06-28','5:15 AM','Miami Gardens, Fla.','Colombia','Portugal'),
  ('K','2026-06-28','5:15 AM','Atlanta Stadium','DR Congo','Uzbekistan'),
  ('J','2026-06-28','7:45 AM','Kansas City, Mo.','Algeria','Austria'),
  ('J','2026-06-28','7:45 AM','Arlington, Texas','Jordan','Argentina')
) AS gm(group_name, match_date, match_time, venue, home_name, away_name)
JOIN teams ht ON ht.team_name = gm.home_name
JOIN teams at ON at.team_name = gm.away_name;

-- Insert bracket slots (1-32 for R32 teams, then winner slots)
INSERT INTO bracket_slots (round_name, slot_number)
SELECT 'round_of_32', generate_series(1, 32)
ON CONFLICT (slot_number) DO NOTHING;

-- Insert owner_rankings rows (one per owner, starting at 0)
INSERT INTO owner_rankings (owner_id, total_points, goal_difference)
SELECT id, 0, 0 FROM owners
ON CONFLICT (owner_id) DO NOTHING;

-- Insert knockout match fixtures (placeholders - teams assigned via bracket slots)
INSERT INTO matches (stage, group_name, match_date, match_time, venue, slot_number)
VALUES
  -- Round of 32
  ('round_of_32', NULL, '2026-06-29', '12:45 AM', 'Inglewood, Calif.', 33),
  ('round_of_32', NULL, '2026-06-29', '10:45 PM', 'Houston', 36),
  ('round_of_32', NULL, '2026-06-30', '2:15 AM', 'Foxborough, Mass.', 33),
  ('round_of_32', NULL, '2026-06-30', '6:45 AM', 'Guadalupe, Mexico', 36),
  ('round_of_32', NULL, '2026-06-30', '10:45 PM', 'Arlington, Texas', 43),
  ('round_of_32', NULL, '2026-07-01', '2:45 AM', 'East Rutherford, N.J.', 34),
  ('round_of_32', NULL, '2026-07-01', '6:45 AM', 'Mexico City', 44),
  ('round_of_32', NULL, '2026-07-01', '9:45 PM', 'Atlanta', 44),
  ('round_of_32', NULL, '2026-07-02', '1:45 AM', 'Seattle', 40),
  ('round_of_32', NULL, '2026-07-02', '5:45 AM', 'Santa Clara, Calif.', 39),
  ('round_of_32', NULL, '2026-07-03', '12:45 AM', 'Inglewood, Calif.', 38),
  ('round_of_32', NULL, '2026-07-03', '4:45 AM', 'Toronto', 37),
  ('round_of_32', NULL, '2026-07-03', '8:45 AM', 'Vancouver, Canada', 47),
  ('round_of_32', NULL, '2026-07-03', '11:45 PM', 'Arlington, Texas', 46),
  ('round_of_32', NULL, '2026-07-04', '3:45 AM', 'Miami Gardens, Fla.', 45),
  ('round_of_32', NULL, '2026-07-04', '7:15 AM', 'Kansas City, Mo.', 48),
  -- Round of 16
  ('round_of_16', NULL, '2026-07-04', '10:45 PM', 'Houston', 51),
  ('round_of_16', NULL, '2026-07-05', '2:45 AM', 'Philadelphia', 49),
  ('round_of_16', NULL, '2026-07-06', '1:45 AM', 'East Rutherford, N.J.', 53),
  ('round_of_16', NULL, '2026-07-06', '5:45 AM', 'Mexico City', 54),
  ('round_of_16', NULL, '2026-07-07', '12:45 AM', 'Arlington, Texas', 51),
  ('round_of_16', NULL, '2026-07-07', '2:45 AM', 'Seattle', 52),
  ('round_of_16', NULL, '2026-07-07', '9:45 PM', 'Atlanta', 55),
  ('round_of_16', NULL, '2026-07-08', '1:45 AM', 'Vancouver, Canada', 56),
  -- Quarterfinals
  ('quarterfinal', NULL, '2026-07-10', '1:45 AM', 'Foxborough, Mass.', 57),
  ('quarterfinal', NULL, '2026-07-11', '12:45 AM', 'Inglewood, Calif.', 58),
  ('quarterfinal', NULL, '2026-07-12', '2:45 AM', 'Miami Gardens, Fla.', 59),
  ('quarterfinal', NULL, '2026-07-12', '6:45 AM', 'Kansas City, Mo.', 60),
  -- Semifinals
  ('semifinal', NULL, '2026-07-15', '12:45 AM', 'TBD', 61),
  ('semifinal', NULL, '2026-07-16', '12:45 AM', 'TBD', 62),
  -- Final
  ('final', NULL, '2026-07-20', '12:45 AM', 'TBD', 63);
