drop function if exists public.cancel_client_document_request(uuid, text);

create function public.cancel_client_document_request(
  p_request_id uuid,
  p_tracking_token text
)
returns table (
  id uuid,
  status text,
  document_title text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if p_tracking_token is null or p_tracking_token not like 'reqtrk_v1_%' then
    return;
  end if;

  return query
  update public.document_requests dr
  set
    status = 'cancelled',
    billing_status = 'non_billable',
    updated_at = now()
  from public.documents d
  where dr.id = p_request_id
    and dr.document_id = d.id
    and dr.tracking_token_hash = encode(digest(p_tracking_token, 'sha256'), 'hex')
    and dr.status in ('pending', 'in_progress')
  returning
    dr.id,
    dr.status::text,
    d.title,
    dr.created_at,
    dr.updated_at;
end;
$$;

grant execute on function public.cancel_client_document_request(uuid, text) to anon;
grant execute on function public.cancel_client_document_request(uuid, text) to authenticated;