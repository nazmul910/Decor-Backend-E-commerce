const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id:String,
  title:String,
  price:Number,
  quantity:Number,
  imgUrl:String,
  category:String
});

const orderSchema = new mongoose.Schema({
  products:[productSchema],
  total:Number,
  orderDate: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('Order',orderSchema);