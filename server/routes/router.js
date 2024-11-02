const express = require('express');
const router = express.Router();
const Register = require('../model/login1'); // Import the User model
// Route to handle user registration
const Products =require("../model/login2");
const path=require('path');
const multer=require('multer')
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if password and confirm password match
      
      // Check if user with provided email already exists
      const existingUser = await Register.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // Create new user
      const newUser = new Register({ name, email, password });
      await newUser.save();
  
     // res.status(201).json({ message: 'User registered successfully' });
     res.status(201).json({ message: 'User registered successfully', newuser });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  //================================================================================================
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // First, check in the Shopkeeper database
     
  
      // If not found in the Shopkeeper database, check in the User database
      let user = await Register.findOne({ email });
  
      if (user) {
        // If found in the user database, check the password
        if (user.password !== password) {
          return res.status(400).json({ message: 'Invalid credentials for user' });
        }
        // If the password matches, return the response with a flag indicating the user is a regular user
        return res.status(200).json({ message: 'User logged in successfully', userType: 'user', user });
      }
  
      // If the email is not found in both databases, return an error
      return res.status(400).json({ message: 'Email not registered as user or shopkeeper' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../../ProductDataManage/client/public/Assets'); // Define the destination folder directly
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid filename conflicts
    }
  });
  
  
  const upload = multer({ storage });
  
  // Middleware to parse JSON and URL-encoded data
 
  
  // Route to handle product registration with file uploads
  router.post('/products', upload.fields([{ name: 'productImage' }, { name: 'billImage' }]), async (req, res) => {
    const { serialId, name, quantity, purchaseDate, purchaseTime, companyName, WholeSalerName, guarantee, warranty, WholeSalerNumber, price, email, isReturn, isReplace, dateOfReturnOrReplace, reason, returnOrReplaceQuantity } = req.body;
  
    let productImage = '';
    let billImage = '';
  
    if (req.files && req.files.productImage) {
      productImage = req.files.productImage[0].filename; // Get filename from uploaded file
    }
  
    if (req.files && req.files.billImage) {
      billImage = req.files.billImage[0].filename; // Get filename from uploaded file
    }
  
    try {
      // Find if a product with the same purchaseDate, purchaseTime, and email already exists
      let existingProduct = await Products.findOne({ purchaseDate, purchaseTime, email });
  
      if (existingProduct) {
        // If the product already exists, push the new product details to the products array
        existingProduct.products.push({
          serialId,
          name,
          quantity,
          companyName,
          WholeSalerName,
          guarantee,
          warranty,
          WholeSalerNumber,
          price,
          image:productImage,
          billImage,
          isReturn,
          isReplace,
          dateOfReturnOrReplace,
          reason,
          returnOrReplaceQuantity
        });
        await existingProduct.save();
      } else {
        // If the product does not exist, create a new entry
        const product = new Products({
          purchaseDate,
          purchaseTime,
          email,
          products: [{
            serialId,
            name,
            quantity,
            companyName,
            WholeSalerName,
            guarantee,
            warranty,
            WholeSalerNumber,
            price,
            image:productImage,
            billImage,
            isReturn,
            isReplace,
            dateOfReturnOrReplace,
            reason,
            returnOrReplaceQuantity
          }],
          billImage
        });
  
        await product.save();
      }
  
      res.status(201).json({ message: 'Product registered successfully' });
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).json({ message: 'Failed to register product' });
    }
  });
  //==========================================================================================
  router.post('/searchProduct', async (req, res) => {
    const { serialId, email } = req.body;
    console.log('Email:', email);
    console.log('Serial ID:', serialId);
  
    try {
      // Find all documents where the email matches
      const userProductsList = await Products.find({ email });
      console.log('User Products:', userProductsList);
             
      if (userProductsList.length > 0) {
        // Iterate through all documents found
        for (const userProducts of userProductsList) {
          // Search for the product within the products array by serialId
          const foundProduct = userProducts.products.find(
            (product) => product.serialId === serialId
          );
  
          if (foundProduct) {
            // Include purchaseDate, purchaseTime, and billImage along with product details
            const productWithAdditionalInfo = {
              ...foundProduct, // Spread all fields from the found product
              purchaseDate: userProducts.purchaseDate, // Include purchaseDate
              purchaseTime: userProducts.purchaseTime, // Include purchaseTime
              billImage: userProducts.billImage // Include billImage
            };
  
            // Return the found product details along with the additional information
            return res.json(productWithAdditionalInfo);
          }
        }
  
        // If no matching serialId is found after iterating through all documents
        res.status(404).json({ message: 'Product not found.' });
      } else {
        res.status(404).json({ message: 'No products found for this user.' });
      }
    } catch (error) {
      console.error('Error while searching for product:', error);
      res.status(500).json({ message: 'Error occurred while searching for product.' });
    }
  });
  // Example Express.js route to get bills by user email
  router.get('/bills/:email', async (req, res) => {
    try {
      const email = req.params.email;
      console.log(email);
  
      // Fetch bills and sort them by date in descending order
      const bills = await Products.find({ email: email }).sort({ purchaseDate: -1 });
  
      console.log(bills);
      res.json(bills);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  // Fetch user data
router.get('/user/:email', async (req, res) => {
  try {
    const user = await Register.findOne({ email: req.params.email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user data
router.put('/updateUser/:email', async (req, res) => {
  try {
    const { name, password } = req.body;
    const updatedUser = await Register.findOneAndUpdate(
      { email: req.params.email },
      { name, password },
      { new: true }
    );

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  
module.exports = router;