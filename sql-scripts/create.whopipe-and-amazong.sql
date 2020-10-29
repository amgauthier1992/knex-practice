--This script is performing 3 transactions.

-- The first transaction creates a table, whopipe_video_views, which has 4 columns.
-- Note the IF NOT EXISTS, which prevents the CREATE TABLE from being attempted when the table already exists.

CREATE TABLE IF NOT EXISTS whopipe_video_views (
    view_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    video_name TEXT NOT NULL,
    region TEXT NOT NULL,
    date_viewed TIMESTAMP DEFAULT now() NOT NULL
);

--The second transaction creates a new type called department, which is an ENUM. An ENUM is a list of options that may be used by columns (which have this new type) in a table.
--CREATE TYPE doesn't support IF NOT EXISTS so instead we remove the type if it does exist first.

DROP TYPE IF EXISTS department;
CREATE TYPE department AS ENUM (
    'Electronics',
    'Cleaning',
    'Grocery',
    'Furniture',
    'Stationery',
    'Clothing',
    'DIY',
    'Sports',
    'Homeware',
    'Games',
    'Transport'
);

--The third transaction creates a table called amazong_products. This table has 5 columns. Two interesting columns are the price and the category.
--The price is set to a decimal which can be 12 in "precision" and 2 decimal points.
--The category column has the type of department which is the ENUM we created in the second transaction. When we insert rows into the amazong_products table, their value for category 
--would need to be one of those listed in the ENUM for department. In other words, if 'Electronics' is used as the value, that's fine, but if 'Foo' is used as a value, it won't work
--because it isn't in the ENUM list of possible values.

CREATE TABLE IF NOT EXISTS amazong_products (
    product_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    price decimal(12,2) NOT NULL,
    image TEXT,
    category department NOT NULL
);