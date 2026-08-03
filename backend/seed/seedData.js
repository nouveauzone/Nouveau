const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  {
    title: "Red Kurti",
    description: "Beautiful ethnic wear",
    price: 1999,
    originalPrice: 1999,
    category: "Indian Ethnic Wear",
    images: ["ethnic1.jpg"],
    sizes: [{ size: "Free Size", quantity: 10 }],
    gender: "Women"
  },
  {
    title: "Western Dress",
    description: "Stylish western wear",
    price: 2499,
    originalPrice: 2499,
    category: "Indian Western Wear",
    images: ["western1.jpg"],
    sizes: [{ size: "Free Size", quantity: 5 }],
    gender: "Women"
  }
];

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("MongoDB Connected");

    await Product.deleteMany(); // optional
    await Product.insertMany(products); // CORRECT

    console.log("Data inserted successfully");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });