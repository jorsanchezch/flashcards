-- Local-only SQLite schema. GitHub Pages still consumes exported JSON.

CREATE TABLE IF NOT EXISTS bible_versions (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  gateway_param TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  chapter_slug TEXT,
  chapter_title TEXT,
  book_id TEXT,
  book_label TEXT,
  chapter INTEGER,
  canon_index INTEGER,
  original_number INTEGER,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  note_link TEXT,
  raw_markdown TEXT
);

CREATE TABLE IF NOT EXISTS glossary_entries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  proper_name INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS glossary_entry_versions (
  entry_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  term TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (entry_id, version_id),
  FOREIGN KEY (entry_id) REFERENCES glossary_entries(id),
  FOREIGN KEY (version_id) REFERENCES bible_versions(id)
);

CREATE TABLE IF NOT EXISTS glossary_aliases (
  entry_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  PRIMARY KEY (entry_id, version_id, alias),
  FOREIGN KEY (entry_id) REFERENCES glossary_entries(id),
  FOREIGN KEY (version_id) REFERENCES bible_versions(id)
);

CREATE TABLE IF NOT EXISTS glossary_related (
  entry_id TEXT NOT NULL,
  related_id TEXT NOT NULL,
  rel TEXT NOT NULL,
  PRIMARY KEY (entry_id, related_id),
  FOREIGN KEY (entry_id) REFERENCES glossary_entries(id),
  FOREIGN KEY (related_id) REFERENCES glossary_entries(id)
);

CREATE TABLE IF NOT EXISTS bible_passages (
  version_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (version_id, book_id, chapter, verse),
  FOREIGN KEY (version_id) REFERENCES bible_versions(id)
);

-- Later: hits of a glossary form in bible_passages for a version. Empty until ingested.
CREATE TABLE IF NOT EXISTS glossary_bible_hits (
  entry_id TEXT NOT NULL,
  version_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  form TEXT NOT NULL,
  PRIMARY KEY (entry_id, version_id, book_id, chapter, verse, form),
  FOREIGN KEY (entry_id) REFERENCES glossary_entries(id),
  FOREIGN KEY (version_id) REFERENCES bible_versions(id)
);

