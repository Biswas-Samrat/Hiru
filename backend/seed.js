const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const menuItems = [
  {
    name: "Signature Crab Curry Kottu",
    description: "The theatrical masterpiece. Fresh crab, hand-tossed kottu with our secret blend of 18 Sri Lankan spices.",
    price: 28.50,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 20
  },
  {
    name: "Classic Chicken Kottu",
    description: "Traditional street-style kottu rotti with succulent chicken pieces and aromatic curry base.",
    price: 22.00,
    category: "Kottu",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 15
  },
  {
    name: "Jackfruit Fusion Kottu",
    description: "Our signature vegan twist on the classic. Young jackfruit simmered in coconut milk and tossed with crispy rotti.",
    price: 21.00,
    category: "Kottu",
    isVegetarian: true,
    isSpicy: true,
    prepTime: 15
  },
  {
    name: "Ceylon Spiced Burger",
    description: "Wagyu beef patty infused with Sri Lankan peppercorns, topped with date chutney and spicy mayo.",
    price: 24.00,
    category: "Burgers",
    isVegetarian: false,
    isSpicy: false,
    prepTime: 12
  },
  {
    name: "Lankan Lamprais Rice",
    description: "Rice cooked in meat stock, served with frikkadels, eggplant moju, and shrimp blachan, wrapped in banana leaf.",
    price: 26.00,
    category: "Rice",
    isVegetarian: false,
    isSpicy: true,
    prepTime: 25
  },
  {
    name: "Coconut Milk Hopper Fusion",
    description: "Crispy-edged rice flour pancakes with a soft center, served with pol sambol and choice of curry.",
    price: 18.00,
    category: "Fusion",
    isVegetarian: true,
    isSpicy: false,
    prepTime: 10
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');
    
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
