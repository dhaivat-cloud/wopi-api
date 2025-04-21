// const mongoose = require("mongoose");

// const LabelSchema = new mongoose.Schema({
//     label: { type: String, required: true },
//     description: { type: String, required: true },
//     displayName: { type: String, required: true } 
// });

// const GroupSchema = new mongoose.Schema({
//     groupid: { type: Number, required: true },
//     groupname: { type: String, required: true },
//     labels: [LabelSchema]
// });

// const ProductSchema = new mongoose.Schema({
//     productid: { type: Number, required: true },
//     productname: { type: String, required: true },
//     groups: [GroupSchema]
// });

// const Product = mongoose.model("Product", ProductSchema);

// module.exports = Product;



const mongoose = require("mongoose");

const LabelSchema = new mongoose.Schema({
    label: { type: String, required: true },
    description: { type: String, required: true },
    displayName: { type: String, required: true } 
});

const SubgroupSchema = new mongoose.Schema({
    subgroupid: { type: Number, required: true },
    subgroupname: { type: String, required: true },
    labels: [LabelSchema]  // Subgroups will contain labels
});

const GroupSchema = new mongoose.Schema({
    groupid: { type: Number, required: true },
    groupname: { type: String, required: true },
    subgroups: [SubgroupSchema]  // Groups will now contain subgroups instead of directly containing labels
});

const ProductSchema = new mongoose.Schema({
    productid: { type: Number, required: true },
    productname: { type: String, required: true },
    groups: [GroupSchema]
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;


