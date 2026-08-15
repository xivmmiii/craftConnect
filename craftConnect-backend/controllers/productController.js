import Product from "../models/productModel.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await Product.findById(id);
        if (products !== null) return res.status(200).json(products);
        return res.status(404).json({
            message: "Product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can add products",
            });

        const { name, price, category } = req.body;
        const sellerID = req.user.id;

        const product = await Product.create({
            name,
            price,
            category,
            sellerID,
        });

        if (product)
            return res.status(201).json({
                message: "Product added successfully",
                product: product,
            });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
};

export const updateProduct= async (req, res) => {
    try {
        const role = req.user.role;

        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can update products",
            });

        const { id } = req.params;
        const product = await Product.findById(id); //new:true means updated object willl be returned

        if (product !== null) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only delete your own products",
                });
            }
            const { name, price, category } = req.body;
            product.name = name || product.name;
            product.price = price || product.price;
            product.category = category || product.category;
            await product.save();
            return res.status(200).json({
                message: "Product updated successfully",
            });
        }

        return res.status(404).json({
            message: "product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "Bad request",
            error: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can delete products",
            });
        const { id } = req.params;
        const product = await Product.findById(id);

        if (product !== null) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only delete your own products",
                });
            }
            await Product.findByIdAndDelete(id);
            return res.status(204).json({
                //used for no content
                message: "Product deleted successfully",
            });
        }
        return res.status(404).json({
            message: "product not found",
        });
    } catch (error) {
        res.status(400).json({
            message: "bad request",
            error: error.message,
        });
    }
};
