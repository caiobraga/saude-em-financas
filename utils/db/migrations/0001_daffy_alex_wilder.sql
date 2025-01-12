ALTER TABLE recess_times
ALTER COLUMN date_begin TYPE timestamp without time zone
USING date_begin::timestamp without time zone;

ALTER TABLE recess_times
ALTER COLUMN date_end TYPE timestamp without time zone
USING date_end::timestamp without time zone;
