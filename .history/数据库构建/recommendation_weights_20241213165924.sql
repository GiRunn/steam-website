CREATE OR REPLACE FUNCTION calculate_behavior_weights()
RETURNS TABLE (
    user_id INTEGER,
    game_id INTEGER,
    weight NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.user_id,
        ub.game_id,
        SUM(
            CASE ub.behavior_type
                WHEN 'view' THEN 0.1
                WHEN 'wishlist' THEN 0.3
                WHEN 'cart' THEN 0.4
                WHEN 'purchase' THEN 0.6
                WHEN 'review' THEN 0.8
            END
        ) as weight
    FROM user_behaviors ub
    GROUP BY ub.user_id, ub.game_id;
END;
$$ LANGUAGE plpgsql; 