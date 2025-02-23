create table
  dallas.properties (
    id uuid not null default extensions.uuid_generate_v4 (),
    reply boolean null,
    address text not null,
    city text not null default 'Dallas'::text,
    state text not null default 'TX'::text,
    zip text not null default '75214'::text,
    owner text not null,
    latitude double precision null,
    longitude double precision null,
    geom geometry null,
    inside_cpc boolean null,
    inside_original boolean null,
    is_contributing boolean null,
    signed_petition boolean null,
    constraint properties_pkey primary key (id),
    constraint properties_address_key unique (address)
  ) tablespace pg_default;