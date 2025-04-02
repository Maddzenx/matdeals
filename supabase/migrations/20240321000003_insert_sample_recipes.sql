-- Insert sample recipes
INSERT INTO recipes (title, description, ingredients, instructions, category) VALUES
(
    'Pasta Carbonara',
    'Klassisk italiensk pasta carbonara med ägg, pancetta och parmesan',
    '[
        {"name": "Spaghetti", "amount": 400, "unit": "g"},
        {"name": "Ägg", "amount": 4, "unit": "st"},
        {"name": "Pancetta", "amount": 200, "unit": "g"},
        {"name": "Parmesan", "amount": 100, "unit": "g"},
        {"name": "Svartpeppar", "amount": 1, "unit": "tsk"},
        {"name": "Salt", "amount": 1, "unit": "tsk"}
    ]'::jsonb,
    ARRAY[
        'Koka pastan enligt anvisningarna på förpackningen.',
        'Stek pancettan tills den är krispig.',
        'Vispa ihop ägg och riven parmesan.',
        'Häll av pastan och blanda med äggblandningen och pancettan.',
        'Krydda med svartpeppar och servera.'
    ],
    'Pasta'
),
(
    'Kycklinggryta',
    'Ugnsbakad kycklinggryta med grönsaker',
    '[
        {"name": "Kycklinglår", "amount": 4, "unit": "st"},
        {"name": "Potatis", "amount": 500, "unit": "g"},
        {"name": "Morötter", "amount": 300, "unit": "g"},
        {"name": "Lök", "amount": 2, "unit": "st"},
        {"name": "Vitlök", "amount": 4, "unit": "klyftor"},
        {"name": "Timjan", "amount": 1, "unit": "msk"},
        {"name": "Olivolja", "amount": 2, "unit": "msk"},
        {"name": "Salt", "amount": 1, "unit": "tsk"},
        {"name": "Peppar", "amount": 1, "unit": "tsk"}
    ]'::jsonb,
    ARRAY[
        'Sätt ugnen på 200°C.',
        'Skär potatis och morötter i bitar.',
        'Lägg kyckling, grönsaker och kryddor i en ugnssäker form.',
        'Häll över olivolja och rör om.',
        'Grädda i ugnen i 45-60 minuter tills kycklingen är genomstekt.'
    ],
    'Kött'
),
(
    'Vegetarisk Lasagne',
    'Lasagne med grönsaker och ost',
    '[
        {"name": "Lasagneplattor", "amount": 12, "unit": "st"},
        {"name": "Zucchini", "amount": 2, "unit": "st"},
        {"name": "Aubergine", "amount": 1, "unit": "st"},
        {"name": "Paprika", "amount": 2, "unit": "st"},
        {"name": "Lök", "amount": 1, "unit": "st"},
        {"name": "Vitlök", "amount": 2, "unit": "klyftor"},
        {"name": "Tomatsås", "amount": 500, "unit": "g"},
        {"name": "Riven ost", "amount": 200, "unit": "g"},
        {"name": "Ricotta", "amount": 250, "unit": "g"},
        {"name": "Olivolja", "amount": 2, "unit": "msk"},
        {"name": "Basilika", "amount": 1, "unit": "msk"},
        {"name": "Salt", "amount": 1, "unit": "tsk"},
        {"name": "Peppar", "amount": 1, "unit": "tsk"}
    ]'::jsonb,
    ARRAY[
        'Sätt ugnen på 200°C.',
        'Skär grönsakerna i bitar och stek dem i olivolja.',
        'Blanda ricotta med kryddor.',
        'Varva lasagneplattor, grönsaker, tomatsås och ricottablandning i en ugnssäker form.',
        'Avsluta med riven ost.',
        'Grädda i ugnen i 30-40 minuter tills osten är gyllenbrun.'
    ],
    'Vegetariskt'
); 