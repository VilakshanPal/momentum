-- Clients become records (id, brand, contact name, email) and projects point at them by id; deleting a client deletes its projects.
-- People gain an email and a role. Names stay the key for people because participants and owners are names everywhere.
alter table clients rename column name to brand;
alter table clients add column id uuid not null default gen_random_uuid();
alter table clients add column name text;
alter table clients add column email text;
alter table clients drop constraint clients_pkey;
alter table clients add primary key (id);
alter table clients add constraint clients_brand_key unique (brand);

alter table projects add column client_id uuid references clients(id) on delete cascade;
insert into clients (brand) select distinct client from projects where client is not null and client <> '' on conflict (brand) do nothing;
update projects p set client_id = c.id from clients c where c.brand = p.client;
alter table projects drop column client;
create index projects_client_idx on projects (client_id);

alter table people add column email text;
alter table people add column role text;
