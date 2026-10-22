--liquibase formatted sql

--changeset batuhan:5
--comment: Add avatar_url column to users table
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
