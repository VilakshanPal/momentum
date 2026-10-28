-- Actions and questions can be added on the board by hand; they have no originating meeting.
alter table items alter column meeting_id drop not null;
