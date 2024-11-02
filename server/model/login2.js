const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  isReturn: {
    type: Boolean,
    default: false
  },
  dateOfReturn: {
    type: Date
  },
  timeOfReturn: {
    type: String
  },
  reasonForReturn: String,
  returnQuantity: {
    type: Number,
    default: 0
  },
  image: String // Added image field for return
});

const replacementSchema = new mongoose.Schema({
  isReplace: {
    type: Boolean,
    default: false
  },
  dateOfReplacement: {
    type: Date
  },
  timeOfReplacement: {
    type: String
  },
  reasonForReplacement: String,
  replacementQuantity: {
    type: Number,
    default: 0
  },
  replacedSerialId: { // Existing field
    type: String,
    required: false // Optional, adjust as needed
  },
  image: String // Added image field for replacement
});

const productDetailSchema = new mongoose.Schema({
  serialId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  companyName: String,
  WholeSalerName: String,
  guarantee: String,
  warranty: String,
  WholeSalerNumber: String,
  price: {
    type: Number
  },
  image: String, // Existing image field
  returnDetails: returnSchema,
  replacementDetails: replacementSchema
});

const productSchema = new mongoose.Schema({
  purchaseDate: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensures uniqueness of email
  },
  purchaseTime: {
    type: String,
    required: true
  },
  products: {
    type: [productDetailSchema],
    validate: {
      validator: function(v) {
        const serialIds = v.map(product => product.serialId);
        return new Set(serialIds).size === serialIds.length;
      },
      message: 'Duplicate serialId found within the products array'
    }
  },
  billImage: String
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
