create or replace function match_messages(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    chat_history.id,
    chat_history.content,
    1 - (chat_history.embedding <=> query_embedding) as similarity
  from chat_history
  where
    chat_history.user_id = user_id
    and 1 - (chat_history.embedding <=> query_embedding) > match_threshold
  order by chat_history.embedding <=> query_embedding
  limit match_count;
end;
$$;