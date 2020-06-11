DROP KEYSPACE IF EXISTS collaborativediting;

CREATE KEYSPACE IF NOT EXISTS collaborativediting
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};

USE collaborativediting;

CREATE TABLE conversations (
  id varchar,
  username varchar,
  text varchar,
  createdat varchar,
  color varchar,
  lastmutationid int,
  lastmutationobject VARCHAR,
  PRIMARY KEY (id)
);

CREATE TABLE mutations (
  id varchar,
  username varchar,
  createdat varchar,
  color varchar,
  mutationid int,
  mutationindex int,
  length varchar,
  text varchar,
  type varchar,
  originalice int,
  originbob int,
  PRIMARY KEY (id, mutationid)
);