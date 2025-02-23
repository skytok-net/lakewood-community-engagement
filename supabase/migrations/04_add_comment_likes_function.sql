CREATE OR REPLACE FUNCTION dallas.increment_comment_likes(p_comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE dallas.comments
  SET likes_count = likes_count + 1
  WHERE id = p_comment_id;
END;
$$;

