import mongoose from 'mongoose';
import fs from 'fs';
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1/monmonmon');
    console.log('database connected');
    return conn;
  } catch (error) {
    console.log('database error');
  }
};

const ProductSchema = new mongoose.Schema(
  {
    source_url: { type: String, required: true, default: 'N/A' },
    name: { type: String, required: true, default: 'N/A' },
    image_url: { type: String, required: true, default: 'N/A' },
    barcode: { type: String, required: true, default: 'N/A' },
    shop: { type: String, required: true, default: 'coles' },
    weight: { type: String, required: true, default: 'N/A' },
    price: { type: String, required: true, default: 'N/A' },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

const getData = async () => {
  await dbConnect();
  const a = await Product.find().exec();
  const productsData = a.map((product) => {
    const productObj = product.toObject();

    // Remove unwanted fields
    delete productObj.__v;
    delete productObj.createdAt;
    delete productObj.updatedAt;

    return productObj;
  });

  // Write the data to a JSON file
  const filePath = './productsData.json';
  try {
    fs.writeFileSync(filePath, JSON.stringify(productsData, null, 2)); // Pretty print with 2 spaces
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error('Error writing data to file:', error);
  }
};

(async () => {
  await getData();
})();
