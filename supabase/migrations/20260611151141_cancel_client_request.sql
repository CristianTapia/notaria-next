create or replace function public.cancel_client_document_request(
  p_request_id uuid,
  p_tracking_token text
)
returns table (
  id uuid,
  status text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.document_requests dr
  set
    status = 'cancelled',
    billing_status = 'non_billable',
    updated_at = now()
  where dr.id = p_request_id
    and dr.tracking_token = p_tracking_token
    and dr.status in ('pending', 'in_progress')
  returning dr.id, dr.status, dr.updated_at;
end;
$$;

grant execute on function public.cancel_client_document_request(uuid, text) to anon;
grant execute on function public.cancel_client_document_request(uuid, text) to authenticated;