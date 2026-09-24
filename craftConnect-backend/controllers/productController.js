import Product from "../models/productModel.js";
import AppError from "../utils/AppError.js";
import {getPagination} from "../utils/pagination.js";
import { PUBLIC_PRODUCT_FILTER } from "../utils/productAvailability.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const products = await Product.find(PUBLIC_PRODUCT_FILTER)
            .skip(skip)
            .limit(limit);
        const totalproducts = await Product.countDocuments(PUBLIC_PRODUCT_FILTER);

        return res.status(200).json({
            products: products,
            totalProducts: totalproducts,
            currentPage: page,
            totalPages: Math.ceil(totalproducts / limit),
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ _id: id, ...PUBLIC_PRODUCT_FILTER });
        if (product)
            return res.status(200).json(product);
        throw new AppError("Product not found", 404);
    } catch (error) {
        next(error);
    }
};

export const getMyProducts = async (req, res, next) => {
    try {
        if (req.user.role !== "seller")
            throw new AppError("Only sellers can view their products", 403);
        const { page, limit, skip } = getPagination(req.query);
        const filter = { sellerID: req.user.id };
        if (req.query.isActive !== undefined)
            filter.isActive = req.query.isActive === "true";
        const [products, totalProducts] = await Promise.all([
            Product.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
            Product.countDocuments(filter),
        ]);
        return res.status(200).json({
            products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can add products",
            });

        const { name, description, imageUrl, price, category, stock } = req.body;
        const sellerID = req.user.id;

        const product = await Product.create({
            name,
            description,
            imageUrl,
            price,
            category,
            sellerID,
            stock,
        });

        if (product)
            return res.status(201).json({
                message: "Product added successfully",
                product: product,
            });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const role = req.user.role;

        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can update products",
            });

        const { id } = req.params;
        const product = await Product.findById(id); //new:true means updated object willl be returned

        if (product !== null && product.isActive === true) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only update your own products",
                });
            }
            const { name, description, imageUrl, price, category, stock } = req.body;
            product.name = name ?? product.name;
            product.description = description ?? product.description;
            product.imageUrl = imageUrl ?? product.imageUrl;
            product.price = price ?? product.price;
            product.category = category ?? product.category;
            product.stock = stock ?? product.stock;
            await product.save();
            return res.status(200).json({
                message: "Product updated successfully",
            });
        }

        throw new AppError("Product not found", 404);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== "seller")
            return res.status(403).json({
                message: "Forbidden: Only sellers can delete products",
            });
        const { id } = req.params;
        const product = await Product.findById(id);

        if ((product !== null && product.isActive) === true) {
            if (req.user.id !== product.sellerID.toString()) {
                return res.status(403).json({
                    message: "Forbidden: You can only delete your own products",
                });
            }
            product.isActive = false;
            await product.save();
            return res.status(200).json({
                message: "Product deactivated successfully",
            });
        }
        throw new AppError("Product not found", 404);
    } catch (error) {
        next(error);
    }
};
