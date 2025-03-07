const mongoose = require("mongoose");

const LabelSchema = new mongoose.Schema({
    label: { type: String, required: true },
    description: { type: String, required: true },
    displayName: { type: String, required: true } // Add this line
});

const GroupSchema = new mongoose.Schema({
    groupid: { type: Number, required: true },
    groupname: { type: String, required: true },
    labels: [LabelSchema]
});

const ProductSchema = new mongoose.Schema({
    productid: { type: Number, required: true },
    productname: { type: String, required: true },
    groups: [GroupSchema]
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;


