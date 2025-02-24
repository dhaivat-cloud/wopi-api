const mongoose = require("mongoose");

const LabelSchema = new mongoose.Schema({
    label: String,
    description: String,    
});

const GroupSchema = new mongoose.Schema({
    groupid: Number,
    groupname: String,
    labels: [LabelSchema],
});

const ProductSchema = new mongoose.Schema({
    productid: Number,
    productname: String,
    groups: [GroupSchema],
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
