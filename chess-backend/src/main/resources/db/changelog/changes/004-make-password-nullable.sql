--liquibase formatted sql

--changeset batuhan:4
--comment: Make password column nullable for Keycloak IAM integration
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
