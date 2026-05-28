export const spiceLevels = ['Mild', 'Medium', 'Spicy', 'Sri Lankan Spicy'];

export const curryBases = [
  'Chicken Curry',
  'Black Pork Curry',
  'Slow Cooked Lamb Curry',
  'Peppered Beef Curry',
  'Egg & Vegetarian Curry',
];

export const menuCategories = [
  'Kottu',
  'String Hoppers Kottu',
  'Lunch',
  'Fusion Devilled Kottu',
  'Noodles',
  'Fried Rice',
  'Special Rice',
  'Burgers',
  'Sides',
  'Kids',
  'Drinks',
  'Desserts',
];

const foodImages = {
  kottu: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
  rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  sides: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',
  drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
};

const customizationByCategory = {
  Kottu: { curryBase: true, spice: true, extras: true },
  'String Hoppers Kottu': { curryBase: true, spice: true, extras: true },
  Noodles: { curryBase: true, spice: true, extras: true },
  'Fusion Devilled Kottu': { spice: true, extras: true },
  Burgers: { extras: true },
  'Fried Rice': { spice: true },
  'Special Rice': { spice: true },
  Lunch: { spice: true },
};

const rawItems = [
  // 1. Mains & Sri Lankan Street Food
  // Hiran's Kottu Rotti
  ['01', 'Chicken Curry Kottu Rotti', 'Kottu', 23, 'Traditional Sri Lankan street-style kottu rotti with chopped godamba rotti, vegetables, egg, and chicken curry.', ['DF'], true, 18, foodImages.kottu],
  ['02', 'Black Pork Curry Kottu Rotti', 'Kottu', 23, 'Rich, aromatic black pork curry tossed through flaky rotti with traditional Sri Lankan street-food spices.', ['DF'], true, 19, foodImages.kottu],
  ['03', 'Slow Cooked Lamb Curry Kottu Rotti', 'Kottu', 23, 'Slow cooked tender lamb curry chopped with rotti, egg, and vegetables finished on the hot plate.', ['DF'], true, 20, foodImages.kottu],
  ['04', 'Peppered Beef Curry Kottu Rotti', 'Kottu', 23, 'Peppered beef curry chopped with rotti, vegetables, egg, and a bold curry base.', ['DF'], true, 18, foodImages.kottu],
  ['05', 'Egg & Vegetarian Curry Kottu Rotti', 'Kottu', 21, 'Vegetarian curry and egg chopped through rotti with fresh vegetables and Sri Lankan spices.', ['DF', 'V'], true, 16, foodImages.kottu],

  // Hiran's Fusion Devilled Kottu Rotti & Specialties
  ['13', 'Chicken Dolphin', 'Fusion Devilled Kottu', 30, 'Loaded fusion kottu with tender chicken, egg, vegetables, and Chef Hiru\'s signature sauce.', [], true, 22, foodImages.kottu],
  ['14', 'Lava Cheese with Any Meat', 'Fusion Devilled Kottu', 30, 'A molten, gooey cheese fusion kottu with your choice of meat and fresh vegetables.', [], false, 22, foodImages.kottu],
  ['15', 'Chicken Devilled', 'Fusion Devilled Kottu', 28, 'Devilled chicken pieces loaded through chopped rotti with bell peppers, onions, and egg.', [], true, 20, foodImages.kottu],
  ['16', 'Pork Devilled', 'Fusion Devilled Kottu', 28, 'Fiery devilled pork fusion kottu with chef\'s signature sweet and spicy sauce.', [], true, 20, foodImages.kottu],
  ['17', 'Beef Devilled', 'Fusion Devilled Kottu', 28, 'Spicy devilled beef, vegetables, egg, and chopped rotti stir-fried on the hot plate.', [], true, 20, foodImages.kottu],
  ['18', 'Devilled Mushrooms', 'Fusion Devilled Kottu', 26, 'Vegetarian devilled mushroom kottu with smoky heat and robust Sri Lankan spices.', ['V'], true, 18, foodImages.kottu],
  ['19', 'Steak & Cheese', 'Fusion Devilled Kottu', 34, 'Premium steak strips and melted cheese folded through a loaded, flavorful kottu base.', [], false, 24, foodImages.kottu],
  ['20', 'Steak & Curry', 'Fusion Devilled Kottu', 34, 'Tender steak, rich curry sauce, vegetables, egg, and chopped rotti.', [], true, 24, foodImages.kottu],
  ['21', 'Spiced BBQ Pork Ribs', 'Fusion Devilled Kottu', 30, 'Succulent BBQ pork ribs with Sri Lankan spices served over a loaded kottu base.', [], true, 24, foodImages.kottu],
  ['22', 'Slow Cooked Lamb Shank', 'Fusion Devilled Kottu', 34, 'Slow cooked fall-off-the-bone lamb shank served with a loaded kottu base.', [], false, 25, foodImages.kottu],

  // Hiran's Noodles
  ['23', 'Chicken Curry Noodles', 'Noodles', 23, 'Stir-fried noodles with chicken curry, fresh vegetables, and Sri Lankan aromatics.', ['DF'], true, 16, foodImages.kottu],
  ['24', 'Black Pork Curry Noodles', 'Noodles', 23, 'Stir-fried noodles with flavorful black pork curry and bold spices.', ['DF'], true, 17, foodImages.kottu],
  ['25', 'Slow Cooked Lamb Curry Noodles', 'Noodles', 23, 'Stir-fried noodles with slow cooked lamb curry and vegetables.', ['DF'], true, 18, foodImages.kottu],
  ['26', 'Peppered Beef Curry Noodles', 'Noodles', 23, 'Peppered beef curry tossed with stir-fried noodles and vegetables.', ['DF'], true, 16, foodImages.kottu],
  ['27', 'Egg & Vegetarian Curry Noodles', 'Noodles', 21, 'Vegetarian curry noodles stir-fried with egg and fresh garden vegetables.', ['DF', 'V'], true, 14, foodImages.kottu],

  // Hiran's Fried Rice
  ['28', 'Chicken Fried Rice', 'Fried Rice', 23, 'Sri Lankan style fried rice with chicken, vegetables, and egg.', ['DF', 'GF'], false, 16, foodImages.rice],
  ['29', 'Pork Fried Rice', 'Fried Rice', 23, 'Fragrant fried rice with tender pork, vegetables, and egg.', ['DF', 'GF'], false, 16, foodImages.rice],
  ['30', 'Beef Fried Rice', 'Fried Rice', 23, 'Stir-fried rice with seasoned beef and mixed vegetables.', ['DF', 'GF'], false, 16, foodImages.rice],
  ['31', 'Seafood Fried Rice', 'Fried Rice', 30, 'Seafood fried rice with prawns, squid, vegetables, and Sri Lankan aromatics.', ['DF', 'GF'], false, 20, foodImages.rice],
  ['32', 'Mixed Fried Rice', 'Fried Rice', 30, 'Mixed protein fried rice (chicken, pork, beef) with vegetables and egg.', ['DF', 'GF'], false, 20, foodImages.rice],

  // Hiran's String Hoppers Kottu
  ['06', 'Chicken Curry String Hoppers Kottu', 'String Hoppers Kottu', 23, 'String hoppers chopped with chicken curry, vegetables, egg, and signature sauce.', ['DF', 'GF'], true, 18, foodImages.kottu],
  ['07', 'Black Pork Curry String Hoppers Kottu', 'String Hoppers Kottu', 23, 'Black pork curry folded through chopped gluten-free string hoppers and egg.', ['DF', 'GF'], true, 19, foodImages.kottu],
  ['08', 'Slow Cooked Lamb String Hoppers Kottu', 'String Hoppers Kottu', 23, 'Slow cooked tender lamb curry with gluten-free string hoppers.', ['DF', 'GF'], true, 20, foodImages.kottu],
  ['09', 'Peppered Beef String Hoppers Kottu', 'String Hoppers Kottu', 23, 'Peppered beef curry chopped with string hoppers, vegetables, and egg.', ['DF', 'GF'], true, 18, foodImages.kottu],
  ['10', 'Egg & Vegetarian String Hoppers Kottu', 'String Hoppers Kottu', 21, 'Vegetarian curry and egg chopped with gluten-free string hoppers.', ['DF', 'GF', 'V'], true, 16, foodImages.kottu],

  // Hiran's Special Rice
  ['33', 'Mixed Chop Suey Rice', 'Special Rice', 32, 'Stir-fried mixed meats and vegetables in a savory sauce served over steamed rice.', [], false, 20, foodImages.rice],
  ['34', 'Chicken & Prawns Nasi Goreng', 'Special Rice', 28, 'Chicken and prawns nasi goreng fried rice with a spicy Sri Lankan kick, topped with a fried egg.', [], true, 20, foodImages.rice],
  ['35', 'Chicken Devilled with Steamed Rice', 'Special Rice', 28, 'Spicy, tangy devilled chicken served alongside hot steamed rice.', [], true, 18, foodImages.rice],
  ['36', 'Pork Devilled with Steamed Rice', 'Special Rice', 28, 'Devilled pork stir-fried with onions and capsicums served with steamed rice.', [], true, 18, foodImages.rice],
  ['37', 'Beef Devilled with Steamed Rice', 'Special Rice', 28, 'Devilled beef cooked in a sweet and spicy sauce served with steamed rice.', [], true, 18, foodImages.rice],
  ['38', 'Prawns Devilled with Steamed Rice', 'Special Rice', 30, 'Fiery devilled prawns served with hot steamed rice.', [], true, 20, foodImages.rice],
  ['39', 'Hot Battered Cuttlefish with Rice', 'Special Rice', 30, 'Crispy hot battered cuttlefish tossed with spicy seasoning and served with rice.', [], true, 20, foodImages.rice],
  ['40', 'Devilled Mushrooms with Steamed Rice', 'Special Rice', 28, 'Smoky and spicy devilled mushrooms served with steamed rice.', ['V'], true, 18, foodImages.rice],

  // 2. Hiran's Burgers & Sides
  // Burgers
  ['41', 'Southern Chicken Burger', 'Burgers', 18, 'Crispy southern fried chicken breast, lettuce, tomato, and house mayo on a toasted bun.', [], false, 12, foodImages.burger],
  ['42', 'Beef Burger', 'Burgers', 18, 'Juicy flame-grilled beef patty, cheese, pickles, lettuce, and Hiran\'s secret sauce.', [], false, 12, foodImages.burger],
  ['43', 'Pork Burger', 'Burgers', 18, 'Seasoned pork patty, rich BBQ sauce, pickles, and crisp coleslaw.', [], false, 12, foodImages.burger],
  ['44', 'Devilled Chicken Burger', 'Burgers', 18, 'Crispy chicken breast coated in a fiery Sri Lankan devilled glaze with spicy mayo.', [], true, 13, foodImages.burger],
  ['45', 'Black Pork Burger', 'Burgers', 18, 'Pork patty seasoned with traditional Sri Lankan black pork curry spices and chutney.', [], true, 13, foodImages.burger],
  ['46', 'Peppered Beef Burger', 'Burgers', 18, 'Beef patty infused with bold Sri Lankan black peppercorns and spicy mayo.', [], true, 13, foodImages.burger],
  ['47', 'Young Jackfruit Burger', 'Burgers', 18, 'Spiced young jackfruit patty, lettuce, tomato, and vegan herb aioli.', ['V'], false, 12, foodImages.burger],

  // Sides
  ['S1', 'Fries', 'Sides', 8, 'Crispy golden fries served with house seasoning.', ['V'], false, 8, foodImages.sides],
  ['S2', 'Curly Fries', 'Sides', 8, 'Seasoned, crispy curly fries.', ['V'], false, 8, foodImages.sides],
  ['S3', 'Onion Rings', 'Sides', 8, 'Crispy, golden-fried onion rings.', ['V'], false, 8, foodImages.sides],
  ['S4', 'Garlic Ciabatta Toast', 'Sides', 8, 'Toasted ciabatta bread spread with rich garlic and herb butter.', ['V'], false, 7, foodImages.sides],
  ['S5', 'Seasonal Vegetables', 'Sides', 8, 'Fresh seasonal vegetables sautéed and finished with light seasoning.', ['V'], false, 8, foodImages.sides],

  // 3. Lunch Specials
  ['11', 'Curry on Rice Bowl', 'Lunch', 15, 'A quick, hearty lunch bowl with fragrant steamed rice and a warming Sri Lankan curry.', ['DF'], true, 12, foodImages.rice],
  ['12', 'Rice with 2 Curries & 1 Protein', 'Lunch', 23, 'A traditional Sri Lankan lunch plate: rice served with two curries and a protein of choice.', ['DF'], true, 16, foodImages.rice],

  // 4. Kids Menu & Desserts
  // Kids
  ['48', 'Cheese burger and fries', 'Kids', 12, 'A kids-sized cheeseburger served with golden fries.', [], false, 10, foodImages.burger],
  ['49', 'Chicken nuggets and fries', 'Kids', 12, 'Crispy, golden chicken nuggets served with fries.', [], false, 10, foodImages.sides],

  // Desserts
  ['50', 'Cream Caramel', 'Desserts', 10, 'Classic silky caramel custard with a smooth, rich caramel syrup finish.', ['V'], false, 6, foodImages.dessert],
  ['51', 'Watalappam', 'Desserts', 10, 'Traditional Sri Lankan jaggery pudding made with coconut milk, spices, egg, and cashews.', ['V'], false, 6, foodImages.dessert],

  // 5. Drinks & Beverages
  ['D1', 'Faluda', 'Drinks', 10, 'Sweet rose milk drink layered with jelly, vermicelli, basil seeds, and a scoop of vanilla ice cream.', ['V'], false, 5, foodImages.drinks],
  ['D2', 'Mango Mojito', 'Drinks', 10, 'Refreshing mocktail with fresh mango puree, mint leaves, lime juice, and soda water.', ['V'], false, 5, foodImages.drinks],
  ['D3', 'Choco Nani', 'Drinks', 10, 'Rich chocolate beverage with vanilla ice cream, inspired by Chef Hiru\'s grandmother\'s secret recipe.', ['V'], false, 5, foodImages.drinks],
  ['D4-strawberry', 'Strawberry Shake', 'Drinks', 9, 'Creamy, thick milkshake with fresh strawberry syrup and vanilla ice cream.', ['V'], false, 5, foodImages.drinks],
  ['D4-caramel', 'Caramel Shake', 'Drinks', 9, 'Rich and smooth milkshake with salted caramel syrup.', ['V'], false, 5, foodImages.drinks],
  ['D4-mint', 'Mint Shake', 'Drinks', 9, 'Refreshing milkshake flavored with mint syrup.', ['V'], false, 5, foodImages.drinks],
  ['D4-banana', 'Banana Shake', 'Drinks', 9, 'Sweet and creamy banana-flavored milkshake.', ['V'], false, 5, foodImages.drinks],
  ['D4-spearmint', 'Spearmint Shake', 'Drinks', 9, 'Cool and crisp spearmint milkshake.', ['V'], false, 5, foodImages.drinks],
  ['D4-vanilla', 'Vanilla Shake', 'Drinks', 9, 'Classic sweet vanilla bean milkshake.', ['V'], false, 5, foodImages.drinks],
  ['D4-chocolate', 'Chocolate Shake', 'Drinks', 9, 'Rich, velvety chocolate milkshake.', ['V'], false, 5, foodImages.drinks],
  ['D4-lime', 'Lime Shake', 'Drinks', 9, 'Zesty and tangy lime milkshake.', ['V'], false, 5, foodImages.drinks],
  ['D5-coke', 'Coke (Can)', 'Drinks', 4, 'Chilled can of Coca-Cola.', [], false, 2, foodImages.drinks],
  ['D5-lp', 'L&P (Can)', 'Drinks', 4, 'Classic Lemon & Paeroa can.', [], false, 2, foodImages.drinks],
  ['D5-fanta', 'Fanta (Can)', 'Drinks', 4, 'Chilled can of orange Fanta.', [], false, 2, foodImages.drinks],
  ['D5-gingerbeer', 'Ginger Beer (Can)', 'Drinks', 4, 'Chilled can of Bundaberg Ginger Beer.', [], false, 2, foodImages.drinks],
  ['D5-sprite', 'Sprite (Can)', 'Drinks', 4, 'Chilled can of lemon-lime Sprite.', [], false, 2, foodImages.drinks],
  ['D5-llb', 'Lemon Lime Bitters', 'Drinks', 4.5, 'Refreshing Lemon Lime Bitters.', [], false, 2, foodImages.drinks],
  ['D6', 'Water', 'Drinks', 4.5, 'Chilled bottled water.', [], false, 2, foodImages.drinks],
];

export const customerMenu = rawItems.map(([code, name, category, price, description, dietary, spicy, prepTime, image]) => ({
  code,
  id: code,
  name,
  category,
  price,
  description,
  dietary,
  isVegetarian: dietary.includes('V'),
  isSpicy: spicy,
  prepTime,
  image,
  customization: customizationByCategory[category] || {},
}));

export const featuredDishes = customerMenu.filter((item) =>
  ['01', '13', '34', '44', '51'].includes(item.code)
);

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
