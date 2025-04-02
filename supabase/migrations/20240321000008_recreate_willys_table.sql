-- Drop and recreate the Willys Johanneberg table
DROP TABLE IF EXISTS "Willys Johanneberg";

CREATE TABLE "Willys Johanneberg" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert products again
INSERT INTO "Willys Johanneberg" (name, price, unit, category, brand) VALUES
-- Pasta Carbonara ingredients
('Spaghetti', 12.90, 'g', 'Skafferi', 'Garant'),
('Ägg', 24.90, 'st', 'Mejeri', 'Garant'),
('Pancetta', 89.90, 'g', 'Chark/Delikatess', 'Garant'),
('Parmesan', 99.90, 'g', 'Ost', 'Garant'),
('Svartpeppar', 19.90, 'tsk', 'Skafferi', 'Garant'),
('Salt', 12.90, 'tsk', 'Skafferi', 'Garant'),

-- Kycklinggryta ingredients
('Kycklinglår', 49.90, 'st', 'Kött', 'Garant'),
('Potatis', 9.90, 'g', 'Grönsaker', 'Garant'),
('Morötter', 12.90, 'g', 'Grönsaker', 'Garant'),
('Lök', 7.90, 'st', 'Grönsaker', 'Garant'),
('Vitlök', 14.90, 'klyftor', 'Grönsaker', 'Garant'),
('Timjan', 19.90, 'msk', 'Skafferi', 'Garant'),
('Olivolja', 39.90, 'msk', 'Skafferi', 'Garant'),

-- Vegetarisk Lasagne ingredients
('Lasagneplattor', 14.90, 'st', 'Skafferi', 'Garant'),
('Zucchini', 19.90, 'st', 'Grönsaker', 'Garant'),
('Aubergine', 14.90, 'st', 'Grönsaker', 'Garant'),
('Paprika', 12.90, 'st', 'Grönsaker', 'Garant'),
('Tomatsås', 24.90, 'g', 'Skafferi', 'Garant'),
('Riven ost', 39.90, 'g', 'Ost', 'Garant'),
('Ricotta', 29.90, 'g', 'Ost', 'Garant'),
('Basilika', 19.90, 'msk', 'Skafferi', 'Garant'); 