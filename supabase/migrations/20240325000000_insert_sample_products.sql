-- Insert sample products with discounts
INSERT INTO public.products (
  product_name,
  description,
  price,
  original_price,
  image_url,
  category,
  store,
  offer_details,
  unit_price
) VALUES
  -- Willys products
  ('Kycklinglår', 'Färska kycklinglår', 49.90, 59.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'meat', 'willys', 'Veckans erbjudande', '49,90 kr/kg'),
  ('Spaghetti', 'Klassisk italiensk pasta', 12.90, 15.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'pasta', 'willys', 'Kortvara!', '12,90 kr/500g'),
  ('Parmesan', 'Italiensk hårdost', 89.90, 99.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'dairy', 'willys', 'Veckans erbjudande', '89,90 kr/200g'),
  ('Äpple Royal Gala', 'Svenska äpplen', 24.90, 29.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'fruits', 'willys', 'Kortvara!', '24,90 kr/kg'),
  
  -- ICA products
  ('Nötfärs 12%', 'Svenskt Butikskött', 69.90, 89.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'meat', 'ica', 'Veckans erbjudande', '69,90 kr/800g'),
  ('Mjölk 3%', 'Svensk mjölk', 12.90, 15.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'dairy', 'ica', 'Kortvara!', '12,90 kr/l'),
  ('Morötter', 'Svenska morötter', 9.90, 12.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'vegetables', 'ica', 'Veckans erbjudande', '9,90 kr/kg'),
  
  -- Hemköp products
  ('Laxfilé', 'Färsk laxfilé', 149.90, 179.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'fish', 'hemkop', 'Veckans erbjudande', '149,90 kr/kg'),
  ('Ris', 'Basmatiris', 19.90, 24.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'pantry', 'hemkop', 'Kortvara!', '19,90 kr/kg'),
  ('Ägg', 'Svenska ägg', 29.90, 34.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'dairy', 'hemkop', 'Veckans erbjudande', '29,90 kr/12-p');

-- Insert some non-discounted products for variety
INSERT INTO public.products (
  product_name,
  description,
  price,
  image_url,
  category,
  store,
  unit_price
) VALUES
  ('Salt', 'Svenskt salt', 9.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'pantry', 'willys', '9,90 kr/500g'),
  ('Peppar', 'Svensk peppar', 12.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'pantry', 'ica', '12,90 kr/100g'),
  ('Vatten', 'Mineralvatten', 5.90, 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg', 'beverages', 'hemkop', '5,90 kr/1.5l'); 