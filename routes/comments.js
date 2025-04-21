const express = require("express");
const Product = require("../models/Products");

const router = express.Router();

/**
 * @swagger
 * /initialize-products:
 *   post:
 *     summary: Add all 3 products to the MongoDB
 *     description: When the database is refreshed, we fill the database with these initial set of values. Dummy values for now.
 *     responses:
 *       201:
 *         description: Products added successfully
 *       400:
 *         description: Products already exist in DB
 *       500:
 *         description: Server error
 */
router.post("/initialize-products", async (req, res) => {
    try {
        const existingProducts = await Product.find();
        if (existingProducts.length > 0) {
            return res.status(400).json({ message: "Products already exist in DB" });
        }

        const initialProducts = [
            {
                productid: 1,
                productname: "sorted",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        subgroups: [
                            {
                                subgroupid: 1,
                                subgroupname: "Primary Addresses",
                                labels: [
                                    { label: "Address 1", description: "Description for Option 1", displayName: "Address One" },
                                    { label: "Firm Address", description: "Description for Option 3", displayName: "Firm Address" },
                                ],
                            },
                            {
                                subgroupid: 2,
                                subgroupname: "Secondary Addresses",
                                labels: [
                                    { label: "Auditor's Postal Address", description: "Description for Option 2", displayName: "Auditor Address" },
                                ],
                            },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        subgroups: [
                            {
                                subgroupid: 1,
                                subgroupname: "Standard Dates",
                                labels: [
                                    { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma", displayName: "Date in Words" },
                                    { label: "${DATE_WITH_SLASH}", description: "Date with slash", displayName: "Date with Slash" },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Add other products similarly
        ];

        await Product.insertMany(initialProducts);
        res.status(201).json({ message: "Products added successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Display all products
 *     description: Retrieves all product information with groups, subgroups and labels
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Server error
 */
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}:
 *   get:
 *     summary: Get a specific product with all its groups, subgroups and labels
 *     description: Fetch complete details for a product based on its name.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/products/:productname", async (req, res) => {
    try {
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups:
 *   post:
 *     summary: Add a new group to a product
 *     description: Adds a new group with optional subgroups to an existing product.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupname:
 *                 type: string
 *                 example: "New Group"
 *               subgroups:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     subgroupname:
 *                       type: string
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           description:
 *                             type: string
 *                           displayName:
 *                             type: string
 *     responses:
 *       201:
 *         description: Group added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/products/:productname/groups", async (req, res) => {
    try {
        const { groupname, subgroups = [] } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const newGroup = {
            groupid: product.groups.length > 0 ? Math.max(...product.groups.map(g => g.groupid)) + 1 : 1,
            groupname,
            subgroups: subgroups.map((subgroup, index) => ({
                subgroupid: index + 1,
                subgroupname: subgroup.subgroupname,
                labels: subgroup.labels || []
            }))
        };

        product.groups.push(newGroup);
        await product.save();
        res.status(201).json({ message: "Group added successfully", group: newGroup });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups:
 *   post:
 *     summary: Add a new subgroup to a group
 *     description: Adds a new subgroup with optional labels to an existing group.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subgroupname:
 *                 type: string
 *                 example: "New Subgroup"
 *               labels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     description:
 *                       type: string
 *                     displayName:
 *                       type: string
 *     responses:
 *       201:
 *         description: Subgroup added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
router.post("/products/:productname/groups/:groupname/subgroups", async (req, res) => {
    try {
        const { subgroupname, labels = [] } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const newSubgroup = {
            subgroupid: group.subgroups.length > 0 ? Math.max(...group.subgroups.map(s => s.subgroupid)) + 1 : 1,
            subgroupname,
            labels
        };

        group.subgroups.push(newSubgroup);
        await product.save();
        res.status(201).json({ message: "Subgroup added successfully", subgroup: newSubgroup });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups/{subgroupname}/labels:
 *   post:
 *     summary: Add a new label to a subgroup
 *     description: Adds a new label to an existing subgroup.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *       - in: path
 *         name: subgroupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subgroup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "LABEL_NAME"
 *               description:
 *                 type: string
 *                 example: "Label description"
 *               displayName:
 *                 type: string
 *                 example: "Label Display Name"
 *     responses:
 *       201:
 *         description: Label added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product, group or subgroup not found
 *       500:
 *         description: Server error
 */
router.post("/products/:productname/groups/:groupname/subgroups/:subgroupname/labels", async (req, res) => {
    try {
        const { label, description, displayName } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const subgroup = group.subgroups.find(s => s.subgroupname.toLowerCase() === req.params.subgroupname.toLowerCase());
        if (!subgroup) return res.status(404).json({ message: "Subgroup not found" });

        const newLabel = { label, description, displayName };
        subgroup.labels.push(newLabel);
        await product.save();
        res.status(201).json(newLabel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}:
 *   put:
 *     summary: Update a group's name
 *     description: Updates the name of an existing group.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Current name of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newGroupName:
 *                 type: string
 *                 example: "Updated Group Name"
 *     responses:
 *       200:
 *         description: Group name updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
router.put("/products/:productname/groups/:groupname", async (req, res) => {
    try {
        const { newGroupName } = req.body;
        if (!newGroupName) return res.status(400).json({ message: "newGroupName is required" });

        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        group.groupname = newGroupName;
        await product.save();
        res.status(200).json({ message: "Group name updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups/{subgroupname}:
 *   put:
 *     summary: Update a subgroup's name
 *     description: Updates the name of an existing subgroup.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *       - in: path
 *         name: subgroupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Current name of the subgroup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newSubgroupName:
 *                 type: string
 *                 example: "Updated Subgroup Name"
 *     responses:
 *       200:
 *         description: Subgroup name updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product, group or subgroup not found
 *       500:
 *         description: Server error
 */
router.put("/products/:productname/groups/:groupname/subgroups/:subgroupname", async (req, res) => {
    try {
        const { newSubgroupName } = req.body;
        if (!newSubgroupName) return res.status(400).json({ message: "newSubgroupName is required" });

        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const subgroup = group.subgroups.find(s => s.subgroupname.toLowerCase() === req.params.subgroupname.toLowerCase());
        if (!subgroup) return res.status(404).json({ message: "Subgroup not found" });

        subgroup.subgroupname = newSubgroupName;
        await product.save();
        res.status(200).json({ message: "Subgroup name updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups/{subgroupname}/labels/{label}:
 *   put:
 *     summary: Update a label in a subgroup
 *     description: Updates a specific label in a subgroup.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *       - in: path
 *         name: subgroupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subgroup
 *       - in: path
 *         name: label
 *         required: true
 *         schema:
 *           type: string
 *         description: Current name of the label
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newLabelName:
 *                 type: string
 *               newDescription:
 *                 type: string
 *               newDisplayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Label updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product, group, subgroup or label not found
 *       500:
 *         description: Server error
 */
router.put("/products/:productname/groups/:groupname/subgroups/:subgroupname/labels/:label", async (req, res) => {
    try {
        const { newLabelName, newDescription, newDisplayName } = req.body;
        if (!newLabelName && !newDescription && !newDisplayName) {
            return res.status(400).json({ message: "At least one field to update is required" });
        }

        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const subgroup = group.subgroups.find(s => s.subgroupname.toLowerCase() === req.params.subgroupname.toLowerCase());
        if (!subgroup) return res.status(404).json({ message: "Subgroup not found" });

        const label = subgroup.labels.find(l => l.label.toLowerCase() === req.params.label.toLowerCase());
        if (!label) return res.status(404).json({ message: "Label not found" });

        if (newLabelName) label.label = newLabelName;
        if (newDescription) label.description = newDescription;
        if (newDisplayName) label.displayName = newDisplayName;

        await product.save();
        res.status(200).json({ message: "Label updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups/{subgroupname}/labels/{label}:
 *   delete:
 *     summary: Delete a label from a subgroup
 *     description: Deletes a specific label from a subgroup.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *       - in: path
 *         name: subgroupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subgroup
 *       - in: path
 *         name: label
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the label to delete
 *     responses:
 *       200:
 *         description: Label deleted successfully
 *       404:
 *         description: Product, group, subgroup or label not found
 *       500:
 *         description: Server error
 */
router.delete("/products/:productname/groups/:groupname/subgroups/:subgroupname/labels/:label", async (req, res) => {
    try {
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const subgroup = group.subgroups.find(s => s.subgroupname.toLowerCase() === req.params.subgroupname.toLowerCase());
        if (!subgroup) return res.status(404).json({ message: "Subgroup not found" });

        const labelIndex = subgroup.labels.findIndex(l => l.label.toLowerCase() === req.params.label.toLowerCase());
        if (labelIndex === -1) return res.status(404).json({ message: "Label not found" });

        subgroup.labels.splice(labelIndex, 1);
        await product.save();
        res.status(200).json({ message: "Label deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}/subgroups/{subgroupname}:
 *   delete:
 *     summary: Delete a subgroup from a group
 *     description: Deletes a specific subgroup from a group.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group
 *       - in: path
 *         name: subgroupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the subgroup to delete
 *     responses:
 *       200:
 *         description: Subgroup deleted successfully
 *       404:
 *         description: Product, group or subgroup not found
 *       500:
 *         description: Server error
 */
router.delete("/products/:productname/groups/:groupname/subgroups/:subgroupname", async (req, res) => {
    try {
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const subgroupIndex = group.subgroups.findIndex(s => s.subgroupname.toLowerCase() === req.params.subgroupname.toLowerCase());
        if (subgroupIndex === -1) return res.status(404).json({ message: "Subgroup not found" });

        group.subgroups.splice(subgroupIndex, 1);
        await product.save();
        res.status(200).json({ message: "Subgroup deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /products/{productname}/groups/{groupname}:
 *   delete:
 *     summary: Delete a group from a product
 *     description: Deletes a specific group from a product.
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product
 *       - in: path
 *         name: groupname
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
router.delete("/products/:productname/groups/:groupname", async (req, res) => {
    try {
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const groupIndex = product.groups.findIndex(g => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (groupIndex === -1) return res.status(404).json({ message: "Group not found" });

        product.groups.splice(groupIndex, 1);
        await product.save();
        res.status(200).json({ message: "Group deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;