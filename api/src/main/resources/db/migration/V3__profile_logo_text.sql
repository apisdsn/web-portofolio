-- Text logo shown top-left on the public site and in the admin dashboard, editable from the admin
ALTER TABLE profile
    ADD COLUMN logo_text TEXT NOT NULL DEFAULT '~/apisdsn';
