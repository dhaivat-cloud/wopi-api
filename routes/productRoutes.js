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
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                        ],
                    },
                ],
            },
            {
                productid: 2,
                productname: "tax-sorted",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                            { label: "${END_DATE}", description: "End Date" },
                            { label: "${FY}", description: "FY" },
                            { label: "${YEAR_END_DATE_IN_WORDS}", description: "Year End Date in Words" },
                        ],
                    },
                ],
            },
            {
                productid: 3,
                productname: "auditomation",
                groups: [
                    {
                        groupid: 1,
                        groupname: "Addresses",
                        labels: [
                            { label: "Address 1", description: "Description for Option 1" },
                            { label: "Auditor's Postal Address", description: "Description for Option 2" },
                            { label: "Firm Address", description: "Description for Option 3" },
                        ],
                    },
                    {
                        groupid: 2,
                        groupname: "Dates",
                        labels: [
                            { label: "${DATE_IN_WORDS}", description: "Dates in Words Without Comma" },
                            { label: "${DATE_WITH_SLASH}", description: "Date with slash" },
                        ],
                    },
                ],
            },
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
 *     summary: Display all 3 products.
 *     description: Retrieves all product information and the groups that are existing as part of those products in the database.
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
 *     summary: Get all the placeholders as a part of a specific product
 *     description: Fetch all the placeholders for a product based on its name.
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
 *     summary: Add or update a group for a product
 *     description: Adds a new group with labels to an existing product. If the group already exists, it updates the group by adding new labels without creating duplicates.
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
 *                 example: "GroupName"
 *               labels:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "${LABEL_NAME}"
 *                     description:
 *                       type: string
 *                       example: "Description of the label"
 *                     displayName:
 *                       type: string
 *                       example: "Label Display Name"
 *     responses:
 *       201:
 *         description: Group updated successfully (existing group found and labels added)
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

router.post("/products/:productname/groups", async (req, res) => {
    try {
        const { groupname, labels } = req.body;
        const product = await Product.findOne({ productname: req.params.productname });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        
        let existingGroup = product.groups.find(group => group.groupname === groupname);

        if (existingGroup) {
        
            const existingLabels = new Set(existingGroup.labels.map(label => label.label));
            const newLabels = labels.filter(label => !existingLabels.has(label.label));

            existingGroup.labels.push(...newLabels);
        } else {
        
            const newGroup = {
                groupid: product.groups.length + 1,
                groupname,
                labels,
            };

            product.groups.push(newGroup);
        }

        await product.save();
        res.status(201).json({ message: "Group updated successfully", product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /products/{productname}/groups/{groupname}/labels:
 *   post:
 *     summary: Add a new label to an existing group
 *     description: Adds a new label to an existing group in a product.
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
 *               label:
 *                 type: string
 *                 example: "LABEL_NAME_SAMPLE"
 *               description:
 *                 type: string
 *                 example: "LABEL_DESCRIPTION_SAMPLEl"
 *     responses:
 *       201:
 *         description: Label added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
router.post("/products/:productname/groups/:groupname/labels", async (req, res) => {
    try {
        const { label, description, displayName } = req.body; 
        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find((g) => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const newLabel = { label, description, displayName }; 
        group.labels.push(newLabel);
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
 *     summary: Update the name of a group
 *     description: Update the name of a specific group within a product.
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
 *         description: Current name of the group to update
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
        if (!newGroupName) {
            return res.status(400).json({ message: "newGroupName is required" });
        }

        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find((g) => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
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
 * /products/{productname}/groups/{groupname}/labels:
 *   post:
 *     summary: Add a new label to an existing group
 *     description: Adds a new label to an existing group in a product.
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
 *               label:
 *                 type: string
 *                 example: "LABEL_NAME_SAMPLE"
 *               description:
 *                 type: string
 *                 example: "LABEL_DESCRIPTION_SAMPLE"
 *               displayName:
 *                 type: string
 *                 example: "LABEL_DISPLAY_NAME_SAMPLE"
 *     responses:
 *       201:
 *         description: Label added successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product or group not found
 *       500:
 *         description: Server error
 */
router.put("/products/:productname/groups/:groupname/labels/:label", async (req, res) => {
    try {
        const { newLabelName, newDescription, newDisplayName } = req.body;
        if (!newLabelName && !newDescription && !newDisplayName) {
            return res.status(400).json({ message: "newLabelName, newDescription, or newDisplayName is required" });
        }

        const product = await Product.findOne({ productname: req.params.productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const group = product.groups.find((g) => g.groupname.toLowerCase() === req.params.groupname.toLowerCase());
        if (!group) return res.status(404).json({ message: "Group not found" });

        const labelToUpdate = group.labels.find((l) => l.label.toLowerCase() === req.params.label.toLowerCase());
        if (!labelToUpdate) return res.status(404).json({ message: "Label not found" });

  
        if (newLabelName) {
            labelToUpdate.label = newLabelName;
        }

    
        if (newDescription) {
            labelToUpdate.description = newDescription;
        }


        if (newDisplayName) {
            labelToUpdate.displayName = newDisplayName;
        }

        await product.save();
        res.status(200).json({ message: "Label name, description, and/or displayName updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
/**
 * @swagger
 * /products/{productname}/groups/{groupname}/labels/{label}:
 *   delete:
 *     summary: Delete a label from a group
 *     description: Deletes a specific label from a group within a product.
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
 *         description: Name of the group containing the label
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
 *         description: Product, group, or label not found
 *       500:
 *         description: Server error
 */
router.delete("/products/:productname/groups/:groupname/labels/:label", async (req, res) => {
    try {
        const { productname, groupname, label } = req.params;

        
        const product = await Product.findOne({ productname });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        
        const group = product.groups.find((g) => g.groupname.toLowerCase() === groupname.toLowerCase());
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

   
        const labelIndex = group.labels.findIndex((l) => l.label.toLowerCase() === label.toLowerCase());
        if (labelIndex === -1) {
            return res.status(404).json({ message: "Label not found" });
        }

      
        group.labels.splice(labelIndex, 1);

    
        await product.save();

        res.status(200).json({ message: "Label deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
/**
 * @swagger
 * /products/{productname}/groups/{groupname}:
 *   delete:
 *     summary: Delete a group from a product
 *     description: Removes a specified group from a product.
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
        const { productname, groupname } = req.params;

        const product = await Product.findOne({ productname });
        if (!product) return res.status(404).json({ message: "Product not found" });

        const groupIndex = product.groups.findIndex(g => g.groupname.toLowerCase() === groupname.toLowerCase());
        if (groupIndex === -1) return res.status(404).json({ message: "Group not found" });

        product.groups.splice(groupIndex, 1);
        await product.save();

        res.status(200).json({ message: "Group deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
