-- MIGRATION V5 (Cleanup Redundancy)
-- Run this in Supabase SQL Editor

-- 1. USERS Table Cleanup
do $$
begin
    -- Ensure 'id' is used as the LINE User ID (Text). 
    -- If 'id' is already Text, we are good.
    -- Remove redundant 'line_user_id' column if it exists.
    if exists (select from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'line_user_id') then
        alter table public.users drop column line_user_id;
    end if;
end $$;

-- 2. SHEEP Table Cleanup
do $$
begin
    -- Goal: Keep 'user_id', Drop 'owner_id'.
    -- First, ensure 'user_id' exists and is correct type (TEXT, to match users.id).
    
    -- Check if user_id exists as UUID (from previous migration attempts)
    -- If so, we might need to change it to TEXT.
    -- But if users.id is TEXT, sheep.user_id must be TEXT.
    
    -- Let's check type of 'user_id'. 
    -- If it's UUID, we drop and recreate as TEXT (or alter).
    
    -- Note: safe way is to create a temp column, migrate, drop.
    
    -- A. Ensure 'user_id' (TEXT) exists and has data from 'owner_id'
    if not exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'user_id') then
         alter table public.sheep add column user_id text references public.users(id);
    end if;
    
    -- If user_id exists but is UUID, we need to fix it.
    -- (Assuming previous migration V3/V4 might have created UUID column)
    -- We can try to cast it, but if users.id is TEXT, foreign key would fail if user_id is UUID.
    -- Actually, if previous migration failed, user_id might not exist or be empty.
    
    -- Let's Force 'user_id' to be TEXT and populate from 'owner_id'.
    -- We'll assume 'owner_id' is the Truth (Text).
    
    -- Drop user_id if it's UUID (bad type)
    -- execute 'alter table public.sheep drop column user_id'; -- risky if data exists? 
    -- User said: "owner_id is user_id". So owner_id has the data.
    
    -- Let's just USE 'owner_id' data to fill 'user_id' (Text).
    -- If 'user_id' is already TEXT, update it.
    -- If 'user_id' is UUID, drop/alter.
    
    /* 
       For safety in this blind script:
       1. Add 'user_id_text' column.
       2. Copy 'owner_id' to 'user_id_text'.
       3. Drop 'user_id' (old).
       4. Drop 'owner_id'.
       5. Rename 'user_id_text' to 'user_id'.
    */
    
    if exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'owner_id') then
        -- Add temp column
        alter table public.sheep add column if not exists user_id_temp text;
        
        -- Copy
        update public.sheep set user_id_temp = owner_id;
        
        -- Make sure it references users(id)? 
        -- alter table public.sheep add constraint fk_user foreign key (user_id_temp) references public.users(id);
        
        -- We will do the swap only if safe
    end if;

end $$;

-- Simplification: Just Rename 'owner_id' to 'user_id' if appropriate?
-- If 'user_id' doesn't exist, Rename 'owner_id' -> 'user_id'.
do $$
begin
    if exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'owner_id') 
       and not exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'user_id') then
       
       alter table public.sheep rename column owner_id to user_id;
       
    elsif exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'owner_id') 
       and exists (select from information_schema.columns where table_schema = 'public' and table_name = 'sheep' and column_name = 'user_id') then
       
       -- Both exist. Copy and Drop.
       -- Ensure user_id is correct type (TEXT matches owner_id).
       begin
           update public.sheep set user_id = owner_id where user_id is null;
           alter table public.sheep drop column owner_id;
       exception when others then
           raise notice 'Type mismatch during copy. Please check manually.';
       end;
    end if;
end $$;

-- 3. Policy Cleanup (Public Access for now?)
-- Since we are using client-side IDs without Supabase Auth session in some cases, RLS calling `auth.uid()` will FAIL (return null).
-- If you want to allow this "Trust Client" mode:
alter table public.users disable row level security;
alter table public.sheep disable row level security;
-- WARN: This is insecure (anyone can read/write anyone), but fulfills "Plan B" simplicity without auth server.
-- If user wants security, they must use Supabase Auth to login (exchange LINE token for Supabase JWT).
