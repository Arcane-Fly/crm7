-- Rate source types
create type public.rate_source_type as enum (
  'FAIRWORK_API',
  'ENTERPRISE_AGREEMENT',
  'MANUAL_ENTRY'
);

-- Enterprise agreements
create table public.enterprise_agreements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document_url text,
  valid_from date not null,
  valid_to date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Base rates table
create table public.pay_rates (
  id uuid primary key default gen_random_uuid(),
  source_type rate_source_type not null,
  source_reference text, -- FairWork award code or EA ID
  classification_code text not null,
  base_rate numeric not null,
  casual_loading numeric,
  valid_from date not null,
  valid_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Penalty rates
create table public.penalty_rates (
  id uuid primary key default gen_random_uuid(),
  pay_rate_id uuid references public.pay_rates(id),
  code text not null,
  rate numeric not null,
  description text,
  conditions jsonb, -- e.g., { "dayOfWeek": "SATURDAY", "timeStart": "0600", "timeEnd": "1800" }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Allowances
create table public.allowances (
  id uuid primary key default gen_random_uuid(),
  pay_rate_id uuid references public.pay_rates(id),
  code text not null,
  amount numeric not null,
  is_percentage boolean default false,
  description text,
  conditions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rate calculation cache
create table public.rate_calculations (
  id uuid primary key default gen_random_uuid(),
  pay_rate_id uuid references public.pay_rates(id),
  calculation_date date not null,
  hours numeric not null,
  base_amount numeric not null,
  casual_loading_amount numeric,
  penalty_amounts jsonb,
  allowance_amounts jsonb,
  total_amount numeric not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Function to calculate total pay rate
create or replace function public.calculate_total_pay_rate(
  p_pay_rate_id uuid,
  p_hours numeric,
  p_date date,
  p_conditions jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb;
  v_pay_rate record;
  v_base_amount numeric;
  v_casual_loading_amount numeric := 0;
  v_penalty_amounts jsonb := '[]'::jsonb;
  v_allowance_amounts jsonb := '[]'::jsonb;
  v_total_amount numeric := 0;
begin
  -- Get base pay rate
  select * into v_pay_rate
  from public.pay_rates
  where id = p_pay_rate_id
    and valid_from <= p_date
    and (valid_to is null or valid_to >= p_date);

  if not found then
    raise exception 'No valid pay rate found for the specified date';
  end if;

  -- Calculate base amount
  v_base_amount := v_pay_rate.base_rate * p_hours;
  v_total_amount := v_base_amount;

  -- Add casual loading if applicable
  if v_pay_rate.casual_loading is not null then
    v_casual_loading_amount := v_base_amount * (v_pay_rate.casual_loading / 100);
    v_total_amount := v_total_amount + v_casual_loading_amount;
  end if;

  -- Calculate applicable penalties
  select jsonb_agg(
    jsonb_build_object(
      'code', p.code,
      'description', p.description,
      'amount', (v_base_amount * (p.rate / 100))
    )
  )
  into v_penalty_amounts
  from public.penalty_rates p
  where p.pay_rate_id = p_pay_rate_id
    and (p.conditions is null or p.conditions <@ p_conditions);

  -- Add penalty amounts to total
  v_total_amount := v_total_amount + coalesce(
    (select sum((value->>'amount')::numeric) from jsonb_array_elements(v_penalty_amounts)),
    0
  );

  -- Calculate applicable allowances
  select jsonb_agg(
    jsonb_build_object(
      'code', a.code,
      'description', a.description,
      'amount', case 
        when a.is_percentage then v_base_amount * (a.amount / 100)
        else a.amount * p_hours
      end
    )
  )
  into v_allowance_amounts
  from public.allowances a
  where a.pay_rate_id = p_pay_rate_id
    and (a.conditions is null or a.conditions <@ p_conditions);

  -- Add allowance amounts to total
  v_total_amount := v_total_amount + coalesce(
    (select sum((value->>'amount')::numeric) from jsonb_array_elements(v_allowance_amounts)),
    0
  );

  -- Build result
  v_result := jsonb_build_object(
    'baseAmount', v_base_amount,
    'casualLoadingAmount', v_casual_loading_amount,
    'penaltyAmounts', v_penalty_amounts,
    'allowanceAmounts', v_allowance_amounts,
    'totalAmount', v_total_amount,
    'metadata', jsonb_build_object(
      'calculatedAt', now(),
      'effectiveDate', p_date,
      'sourceType', v_pay_rate.source_type,
      'sourceReference', v_pay_rate.source_reference,
      'classificationCode', v_pay_rate.classification_code
    )
  );

  -- Cache the calculation
  insert into public.rate_calculations (
    pay_rate_id,
    calculation_date,
    hours,
    base_amount,
    casual_loading_amount,
    penalty_amounts,
    allowance_amounts,
    total_amount,
    metadata,
    expires_at
  ) values (
    p_pay_rate_id,
    p_date,
    p_hours,
    v_base_amount,
    v_casual_loading_amount,
    v_penalty_amounts,
    v_allowance_amounts,
    v_total_amount,
    v_result->'metadata',
    now() + interval '1 day'
  );

  return v_result;
end;
$$;
