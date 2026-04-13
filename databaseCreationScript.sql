-- players of the game. each player has a unique id, a display name, and an avatar color (for the tic tac toe pieces)
create table users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamp with time zone default now(),
  -- Settings columns. added later
  avatar_color text
);

-- actual game lobbies that players join and have a listener for while playing
create table lobbies (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid references users(id) on delete cascade,
  player2_id uuid references users(id) on delete cascade,
  current_turn uuid references users(id), -- whose turn is it
  board_state jsonb not null default '{"cells": [0,0,0,0,0,0,0,0,0], "current_turn": "-1"}',
  status text not null default 'waiting', -- 'waiting', 'active', 'finished'
  winner_id uuid references users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);  

-- players get placed in here for matchamking. A background worker will look at this table every few seconds and try to match players up into lobbies.
create table matchmaking_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  joined_at timestamp with time zone default now()
);



-- Match players function. This will be called by a background worker every few seconds to pair up waiting players.
create or replace function match_players()
returns uuid -- returns lobby_id if match found
language plpgsql
as $$
declare
  v_player1_id uuid;
  v_player2_id uuid;
  v_lobby_id uuid;
begin
  -- Get two oldest waiting players
  select user_id into v_player1_id
  from matchmaking_players
  order by joined_at asc
  limit 1;
  
  if v_player1_id is null then
    return null; -- no players waiting
  end if;
  
  select user_id into v_player2_id
  from matchmaking_players
  where user_id != v_player1_id
  order by joined_at asc
  limit 1;
  
  if v_player2_id is null then
    return null; -- only one player waiting
  end if;
  
  -- Create lobby
  insert into lobbies (player1_id, player2_id, current_turn, status)
  values (v_player1_id, v_player2_id, v_player1_id, 'active')
  returning id into v_lobby_id;
  
  -- Remove both from matchmaking queue
  delete from matchmaking_players
  where user_id in (v_player1_id, v_player2_id);
  
  return v_lobby_id;
end;
$$;