-- Which call of the sample story a meeting is (1 to 10), null for meetings a visitor made from scratch.
-- The next sample offered is the one after the highest published sample in the project.
alter table meetings add column sample_no int;
