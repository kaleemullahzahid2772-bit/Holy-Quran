-- ====================================================================
-- 16-Line Tajweed Quran Database Schema (SQLite / PostgreSQL Compatible)
-- Designed for: Word Search, Harakat Counting, Statistics & Tajweed Analysis
-- ====================================================================

-- 1. PAGES TABLE
CREATE TABLE IF NOT EXISTS pages (
    page_number INTEGER PRIMARY KEY,           -- 1 to 559 (Matching Quran.pdf)
    mushaf_page_number INTEGER,                -- Printed Mushaf page number
    juz_number INTEGER NOT NULL,               -- 1 to 30
    line_count INTEGER DEFAULT 16,             -- Standard 16 lines
    image_path TEXT NOT NULL,                  -- e.g. 'pages/page_004.jpg'
    is_quran_text BOOLEAN DEFAULT 1            -- 1 for pages 2-549, 0 for preliminary/indexes
);

-- 2. SURAHS TABLE
CREATE TABLE IF NOT EXISTS surahs (
    surah_number INTEGER PRIMARY KEY,          -- 1 to 114
    name_arabic TEXT NOT NULL,                 -- e.g. 'الفاتحة'
    name_english TEXT NOT NULL,                -- e.g. 'Al-Fatiha'
    name_urdu TEXT NOT NULL,                   -- e.g. 'سورۃ الفاتحہ'
    revelation_type TEXT NOT NULL,             -- 'Makki' or 'Madani'
    total_ayahs INTEGER NOT NULL,              -- e.g. 7, 286
    start_page INTEGER NOT NULL,               -- Exact start page in 16-line Mushaf
    end_page INTEGER NOT NULL,                 -- Exact end page in 16-line Mushaf
    FOREIGN KEY (start_page) REFERENCES pages(page_number)
);

-- 3. JUZ (PARAS) TABLE
CREATE TABLE IF NOT EXISTS juz (
    juz_number INTEGER PRIMARY KEY,            -- 1 to 30
    name_arabic TEXT NOT NULL,                 -- e.g. 'الم'
    name_english TEXT NOT NULL,                -- e.g. 'Alif Lam Meem'
    start_page INTEGER NOT NULL,               -- Exact page number where Juz begins
    end_page INTEGER NOT NULL,
    FOREIGN KEY (start_page) REFERENCES pages(page_number)
);

-- 4. AYAHS TABLE
CREATE TABLE IF NOT EXISTS ayahs (
    ayah_id INTEGER PRIMARY KEY,               -- 1 to 6236 (Global Ayah index)
    surah_number INTEGER NOT NULL,             -- 1 to 114
    ayah_number INTEGER NOT NULL,              -- 1 to N
    page_number INTEGER NOT NULL,              -- Page where ayah begins
    line_start INTEGER,                        -- 1 to 16
    line_end INTEGER,                          -- 1 to 16
    text_uthmani TEXT,                         -- Standard Uthmanic script
    text_indopak TEXT,                         -- Indo-Pak 16-line script with all diacritics
    sajdah_type TEXT,                          -- NULL, 'Wajib', 'Mustahab'
    FOREIGN KEY (surah_number) REFERENCES surahs(surah_number),
    FOREIGN KEY (page_number) REFERENCES pages(page_number)
);

-- 5. WORDS TABLE (For Word-by-Word Click, Highlight & Occurrence)
CREATE TABLE IF NOT EXISTS words (
    word_id INTEGER PRIMARY KEY,               -- Global word index (~1 to 77,430)
    ayah_id INTEGER NOT NULL,                  -- Foreign key to ayahs
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    word_position_in_ayah INTEGER NOT NULL,    -- 1, 2, 3...
    page_number INTEGER NOT NULL,              -- 2 to 549
    line_number INTEGER NOT NULL,              -- 1 to 16
    text_clean TEXT NOT NULL,                  -- Stripped of harakat for search (e.g. 'الرحمن')
    text_indopak TEXT NOT NULL,                -- Complete Indo-Pak with diacritics
    text_uthmani TEXT,                         -- Uthmani equivalent
    root_word TEXT,                            -- Arabic root word (e.g. 'ر ح م')
    tajweed_rule TEXT,                         -- e.g. 'Ikhfa', 'Qalqala', 'Ghunnah', 'Idgham', 'Tafkheem'
    -- Relative Bounding Box on Page Image (0.0 to 100.0%)
    box_x_pct REAL,                            -- X offset in percent of page width
    box_y_pct REAL,                            -- Y offset in percent of page height
    box_w_pct REAL,                            -- Width in percent of page width
    box_h_pct REAL,                            -- Height in percent of page height
    FOREIGN KEY (ayah_id) REFERENCES ayahs(ayah_id),
    FOREIGN KEY (page_number) REFERENCES pages(page_number)
);

-- 6. WORD CHARACTERS TABLE (For In-Depth Harakat Counting & Diacritic Breakdown)
CREATE TABLE IF NOT EXISTS word_characters (
    char_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    char_position INTEGER NOT NULL,
    base_letter TEXT NOT NULL,                 -- e.g. 'ب', 'ت'
    has_fatha BOOLEAN DEFAULT 0,               -- زبر
    has_kasra BOOLEAN DEFAULT 0,               -- زیر
    has_damma BOOLEAN DEFAULT 0,               -- پیش
    has_fathatan BOOLEAN DEFAULT 0,            -- دو زبر
    has_kasratan BOOLEAN DEFAULT 0,            -- دو زیر
    has_dammatan BOOLEAN DEFAULT 0,            -- دو پیش
    has_standing_fatha BOOLEAN DEFAULT 0,      -- کھڑی زبر
    has_standing_kasra BOOLEAN DEFAULT 0,      -- کھڑی زیر
    has_inverted_damma BOOLEAN DEFAULT 0,      -- الٹا پیش
    has_sukoon BOOLEAN DEFAULT 0,              -- جزم / سکون
    has_shaddah BOOLEAN DEFAULT 0,             -- تشدید
    has_maddah BOOLEAN DEFAULT 0,              -- مد
    tajweed_color TEXT,                        -- 'green', 'blue', 'pink', 'orange', 'black'
    FOREIGN KEY (word_id) REFERENCES words(word_id)
);

-- 7. PAGE STATISTICS TABLE (Pre-computed for 0.1ms Instant Retrieval)
CREATE TABLE IF NOT EXISTS page_statistics (
    page_number INTEGER PRIMARY KEY,
    total_words INTEGER NOT NULL DEFAULT 0,
    total_letters INTEGER NOT NULL DEFAULT 0,
    count_fatha INTEGER NOT NULL DEFAULT 0,           -- کل زبر
    count_kasra INTEGER NOT NULL DEFAULT 0,           -- کل زیر
    count_damma INTEGER NOT NULL DEFAULT 0,           -- کل پیش
    count_fathatan INTEGER NOT NULL DEFAULT 0,        -- کل دو زبر
    count_kasratan INTEGER NOT NULL DEFAULT 0,        -- کل دو زیر
    count_dammatan INTEGER NOT NULL DEFAULT 0,        -- کل دو پیش
    count_sukoon INTEGER NOT NULL DEFAULT 0,          -- کل جزم
    count_shaddah INTEGER NOT NULL DEFAULT 0,         -- کل تشدید
    count_maddah INTEGER NOT NULL DEFAULT 0,          -- کل مد
    count_standing_fatha INTEGER NOT NULL DEFAULT 0,  -- کل کھڑی زبر
    count_heavy_letters INTEGER NOT NULL DEFAULT 0,   -- کل حروفِ مستعلیہ (پر)
    is_calculated BOOLEAN DEFAULT 0,                  -- 0 until verified data is linked
    FOREIGN KEY (page_number) REFERENCES pages(page_number)
);

-- 8. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id TEXT PRIMARY KEY,              -- UUID or timestamp string
    page_number INTEGER NOT NULL,
    surah_number INTEGER,
    surah_name TEXT,
    juz_number INTEGER,
    title TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_number) REFERENCES pages(page_number)
);

-- 9. READING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_page_number INTEGER NOT NULL DEFAULT 2, -- Default to Surah Al-Fatiha (Page 2)
    last_surah_number INTEGER DEFAULT 1,
    last_juz_number INTEGER DEFAULT 1,
    last_read_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_words_search ON words(text_clean);
CREATE INDEX IF NOT EXISTS idx_words_page ON words(page_number, line_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_page ON ayahs(page_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_surah ON ayahs(surah_number, ayah_number);
