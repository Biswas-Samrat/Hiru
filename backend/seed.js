const { connectDB } = require('./config/db');
const MenuItem = require('./models/MenuItem');
const dotenv = require('dotenv');

dotenv.config();

const menuItems = [
  // Mains & Sri Lankan Street Food
  // Hiran's Kottu Rotti
  {
    name: "Chicken Curry Kottu Rotti",
    description: "Traditional Sri Lankan street-style kottu rotti with chopped godamba rotti, vegetables, egg, and chicken curry.",
    price: 23,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Black Pork Curry Kottu Rotti",
    description: "Rich, aromatic black pork curry tossed through flaky rotti with traditional Sri Lankan street-food spices.",
    price: 23,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 19,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Slow Cooked Lamb Curry Kottu Rotti",
    description: "Slow cooked tender lamb curry chopped with rotti, egg, and vegetables finished on the hot plate.",
    price: 23,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Peppered Beef Curry Kottu Rotti",
    description: "Peppered beef curry chopped with rotti, vegetables, egg, and a bold curry base.",
    price: 23,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Egg & Vegetarian Curry Kottu Rotti",
    description: "Vegetarian curry and egg chopped through rotti with fresh vegetables and Sri Lankan spices.",
    price: 21,
    category: "Kottu",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },

  // Hiran's Fusion Devilled Kottu Rotti & Specialties
  {
    name: "Chicken Dolphin",
    description: "Loaded fusion kottu with tender chicken, egg, vegetables, and Chef Hiru's signature sauce.",
    price: 30,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 22,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Lava Cheese with Any Meat",
    description: "A molten, gooey cheese fusion kottu with your choice of meat and fresh vegetables.",
    price: 30,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 22,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chicken Devilled",
    description: "Devilled chicken pieces loaded through chopped rotti with bell peppers, onions, and egg.",
    price: 28,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Pork Devilled",
    description: "Fiery devilled pork fusion kottu with chef's signature sweet and spicy sauce.",
    price: 28,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Beef Devilled",
    description: "Spicy devilled beef, vegetables, egg, and chopped rotti stir-fried on the hot plate.",
    price: 28,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Devilled Mushrooms",
    description: "Vegetarian devilled mushroom kottu with smoky heat and robust Sri Lankan spices.",
    price: 26,
    category: "Fusion Devilled Kottu",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Steak & Cheese",
    description: "Premium steak strips and melted cheese folded through a loaded, flavorful kottu base.",
    price: 34,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 24,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Steak & Curry",
    description: "Tender steak, rich curry sauce, vegetables, egg, and chopped rotti.",
    price: 34,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 24,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Spiced BBQ Pork Ribs",
    description: "Succulent BBQ pork ribs with Sri Lankan spices served over a loaded kottu base.",
    price: 30,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 24,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Slow Cooked Lamb Shank",
    description: "Slow cooked fall-off-the-bone lamb shank served with a loaded kottu base.",
    price: 34,
    category: "Fusion Devilled Kottu",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 25,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },

  // Hiran's Noodles
  {
    name: "Chicken Curry Noodles",
    description: "Stir-fried noodles with chicken curry, fresh vegetables, and Sri Lankan aromatics.",
    price: 23,
    category: "Noodles",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Black Pork Curry Noodles",
    description: "Stir-fried noodles with flavorful black pork curry and bold spices.",
    price: 23,
    category: "Noodles",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 17,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Slow Cooked Lamb Curry Noodles",
    description: "Stir-fried noodles with slow cooked lamb curry and vegetables.",
    price: 23,
    category: "Noodles",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Peppered Beef Curry Noodles",
    description: "Peppered beef curry tossed with stir-fried noodles and vegetables.",
    price: 23,
    category: "Noodles",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Egg & Vegetarian Curry Noodles",
    description: "Vegetarian curry noodles stir-fried with egg and fresh garden vegetables.",
    price: 21,
    category: "Noodles",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 14,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },

  // Hiran's Fried Rice
  {
    name: "Chicken Fried Rice",
    description: "Sri Lankan style fried rice with chicken, vegetables, and egg.",
    price: 23,
    category: "Fried Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Pork Fried Rice",
    description: "Fragrant fried rice with tender pork, vegetables, and egg.",
    price: 23,
    category: "Fried Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Beef Fried Rice",
    description: "Stir-fried rice with seasoned beef and mixed vegetables.",
    price: 23,
    category: "Fried Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Seafood Fried Rice",
    description: "Seafood fried rice with prawns, squid, vegetables, and Sri Lankan aromatics.",
    price: 30,
    category: "Fried Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Mixed Fried Rice",
    description: "Mixed protein fried rice (chicken, pork, beef) with vegetables and egg.",
    price: 30,
    category: "Fried Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },

  // Hiran's String Hoppers Kottu
  {
    name: "Chicken Curry String Hoppers Kottu",
    description: "String hoppers chopped with chicken curry, vegetables, egg, and signature sauce.",
    price: 23,
    category: "String Hoppers Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Black Pork Curry String Hoppers Kottu",
    description: "Black pork curry folded through chopped gluten-free string hoppers and egg.",
    price: 23,
    category: "String Hoppers Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 19,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Slow Cooked Lamb String Hoppers Kottu",
    description: "Slow cooked tender lamb curry with gluten-free string hoppers.",
    price: 23,
    category: "String Hoppers Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Peppered Beef String Hoppers Kottu",
    description: "Peppered beef curry chopped with string hoppers, vegetables, and egg.",
    price: 23,
    category: "String Hoppers Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Egg & Vegetarian String Hoppers Kottu",
    description: "Vegetarian curry and egg chopped with gluten-free string hoppers.",
    price: 21,
    category: "String Hoppers Kottu",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"
  },

  // Hiran's Special Rice
  {
    name: "Mixed Chop Suey Rice",
    description: "Stir-fried mixed meats and vegetables in a savory sauce served over steamed rice.",
    price: 32,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chicken & Prawns Nasi Goreng",
    description: "Chicken and prawns nasi goreng fried rice with a spicy Sri Lankan kick, topped with a fried egg.",
    price: 28,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chicken Devilled with Steamed Rice",
    description: "Spicy, tangy devilled chicken served alongside hot steamed rice.",
    price: 28,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Pork Devilled with Steamed Rice",
    description: "Devilled pork stir-fried with onions and capsicums served with steamed rice.",
    price: 28,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Beef Devilled with Steamed Rice",
    description: "Devilled beef cooked in a sweet and spicy sauce served with steamed rice.",
    price: 28,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Prawns Devilled with Steamed Rice",
    description: "Fiery devilled prawns served with hot steamed rice.",
    price: 30,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Hot Battered Cuttlefish with Rice",
    description: "Crispy hot battered cuttlefish tossed with spicy seasoning and served with rice.",
    price: 30,
    category: "Special Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Devilled Mushrooms with Steamed Rice",
    description: "Smoky and spicy devilled mushrooms served with steamed rice.",
    price: 28,
    category: "Special Rice",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 18,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },

  // Burgers & Sides
  // Burgers
  {
    name: "Southern Chicken Burger",
    description: "Crispy southern fried chicken breast, lettuce, tomato, and house mayo on a toasted bun.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Beef Burger",
    description: "Juicy flame-grilled beef patty, cheese, pickles, lettuce, and Hiran's secret sauce.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Pork Burger",
    description: "Seasoned pork patty, rich BBQ sauce, pickles, and crisp coleslaw.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Devilled Chicken Burger",
    description: "Crispy chicken breast coated in a fiery Sri Lankan devilled glaze with spicy mayo.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 13,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Black Pork Burger",
    description: "Pork patty seasoned with traditional Sri Lankan black pork curry spices and chutney.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 13,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Peppered Beef Burger",
    description: "Beef patty infused with bold Sri Lankan black peppercorns and spicy mayo.",
    price: 18,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 13,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Young Jackfruit Burger",
    description: "Spiced young jackfruit patty, lettuce, tomato, and vegan herb aioli.",
    price: 18,
    category: "Burgers",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },

  // Sides
  {
    name: "Fries",
    description: "Crispy golden fries served with house seasoning.",
    price: 8,
    category: "Sides",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Curly Fries",
    description: "Seasoned, crispy curly fries.",
    price: 8,
    category: "Sides",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Onion Rings",
    description: "Crispy, golden-fried onion rings.",
    price: 8,
    category: "Sides",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Garlic Ciabatta Toast",
    description: "Toasted ciabatta bread spread with rich garlic and herb butter.",
    price: 8,
    category: "Sides",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 7,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Seasonal Vegetables",
    description: "Fresh seasonal vegetables sautéed and finished with light seasoning.",
    price: 8,
    category: "Sides",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },

  // Lunch Specials
  {
    name: "Curry on Rice Bowl",
    description: "A quick, hearty lunch bowl with fragrant steamed rice and a warming Sri Lankan curry.",
    price: 15,
    category: "Lunch",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Rice with 2 Curries & 1 Protein",
    description: "A traditional Sri Lankan lunch plate: rice served with two curries and a protein of choice.",
    price: 23,
    category: "Lunch",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 16,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"
  },

  // Kids Menu & Desserts
  // Kids
  {
    name: "Cheese burger and fries",
    description: "A kids-sized cheeseburger served with golden fries.",
    price: 12,
    category: "Kids",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 10,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chicken nuggets and fries",
    description: "Crispy, golden chicken nuggets served with fries.",
    price: 12,
    category: "Kids",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 10,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },

  // Desserts
  {
    name: "Cream Caramel",
    description: "Classic silky caramel custard with a smooth, rich caramel syrup finish.",
    price: 10,
    category: "Desserts",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 6,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Watalappam",
    description: "Traditional Sri Lankan jaggery pudding made with coconut milk, spices, egg, and cashews.",
    price: 10,
    category: "Desserts",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 6,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
  },

  // Drinks & Beverages
  {
    name: "Faluda",
    description: "Sweet rose milk drink layered with jelly, vermicelli, basil seeds, and a scoop of vanilla ice cream.",
    price: 10,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Mango Mojito",
    description: "Refreshing mocktail with fresh mango puree, mint leaves, lime juice, and soda water.",
    price: 10,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Choco Nani",
    description: "Rich chocolate beverage with vanilla ice cream, inspired by Chef Hiru's grandmother's secret recipe.",
    price: 10,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Strawberry Shake",
    description: "Creamy, thick milkshake with fresh strawberry syrup and vanilla ice cream.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Caramel Shake",
    description: "Rich and smooth milkshake with salted caramel syrup.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Mint Shake",
    description: "Refreshing milkshake flavored with mint syrup.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Banana Shake",
    description: "Sweet and creamy banana-flavored milkshake.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Spearmint Shake",
    description: "Cool and crisp spearmint milkshake.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Vanilla Shake",
    description: "Classic sweet vanilla bean milkshake.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Chocolate Shake",
    description: "Rich, velvety chocolate milkshake.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Lime Shake",
    description: "Zesty and tangy lime milkshake.",
    price: 9,
    category: "Drinks",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Coke (Can)",
    description: "Chilled can of Coca-Cola.",
    price: 4,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "L&P (Can)",
    description: "Classic Lemon & Paeroa can.",
    price: 4,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Fanta (Can)",
    description: "Chilled can of orange Fanta.",
    price: 4,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Ginger Beer (Can)",
    description: "Chilled can of Bundaberg Ginger Beer.",
    price: 4,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Sprite (Can)",
    description: "Chilled can of lemon-lime Sprite.",
    price: 4,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Lemon Lime Bitters",
    description: "Refreshing Lemon Lime Bitters.",
    price: 4.5,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Water",
    description: "Chilled bottled water.",
    price: 4.5,
    category: "Drinks",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 2,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
  }
];

const seedDB = async () => {
  try {
    const { connectDB } = require('./config/db');
    await connectDB();
    console.log('Connected to DB for seeding...');
    
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    
    console.log('Database Seeded Successfully with ' + menuItems.length + ' items!');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
