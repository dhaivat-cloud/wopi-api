const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const authenticateJWT = require("./middlewares/authmiddleware");
const authRoutes = require("./routes/authRoutes");

const productRoutes = require("./routes/productRoutes");

const app = express();



const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Cloudoffis API",
            version: "0.0.1",
            description: "API for managing Cloudoffis products and user authentication",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
        // components: {
        //     securitySchemes: {
        //         BearerAuth: {
        //             type: "http",
        //             scheme: "bearer",
        //             bearerFormat: "JWT",
        //         },
        //     },
        // },
        // security: [{ BearerAuth: [] }], // Apply JWT globally
    },
    apis: ["./server.js", "./routes/*.js"],
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://dhaivatd:dhaivat123@cluster0.xopyf.mongodb.net/productsDB?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once("open", () => console.log("Connected to MongoDB"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
// app.use("/api/auth", authRoutes);
// app.use("/", authenticateJWT, productRoutes);  //USE for AUTH TOKEN
app.use("/",productRoutes) //USE THIS CODE WHEN NOT MAKING USE OF AUTH TOKEN
// Mounting all product routes under /api

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
