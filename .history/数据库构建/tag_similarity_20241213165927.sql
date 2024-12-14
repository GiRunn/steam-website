CREATE OR REPLACE FUNCTION calculate_tag_similarity()
RETURNS TABLE (
    game_id_1 INTEGER,
    game_id_2 INTEGER,
    similarity NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gt1.game_id,
        gt2.game_id,
        COUNT(gt1.tag_id)::NUMERIC / 
        SQRT(COUNT(DISTINCT gt1.tag_id) * COUNT(DISTINCT gt2.tag_id)) as similarity
    FROM game_tags gt1
    JOIN game_tags gt2 ON gt1.tag_id = gt2.tag_id
    WHERE gt1.game_id < gt2.game_id
    GROUP BY gt1.game_id, gt2.game_id;
END;
$$ LANGUAGE plpgsql; 