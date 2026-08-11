import 'dotenv/config'
import express from "express";

const app = express();
app.use(express.json());

const port = 5000;

let ids = 101;

let products = [
    {
        id: ids++,
        name: "joy Bracelet",
        price: 300,
    },

    {
        id: ids++,
        name: "happy Anklet",
        price: 400,
    },

    {
        id: ids++,
        name: "shine Showpiece",
        price: 3000,
    },
];

app.get("/", (req, res) => {
    return res.status(200).send("Welcome to CraftConnect");
});

app.get("/products", (req, res) => {
    return res.status(200).json(products);
});

app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    const product = products.find((product) => product.id === parseInt(id));
    if (product) return res.status(200).json(product);
    else
        return res.status(404).json({
            message: "Product not found",
        });
});

app.post("/products", (req, res) => {
    console.log(req.body);
    const { name, price } = req.body;
    const product = {
        id: ids++,
        name,
        price,
    };
    products.push(product);

    return res.status(201).json({
        message: "Product added successfully",
        product: product,
    });
});

app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const product = products.find((product) => product.id === parseInt(id));
    const { name, price } = req.body;
    if (product) {
        product.name = name;
        product.price = price;
        return res.status(200).json({
            message: "Product updated successfully",
        });
    }
    return res.status(404).json({
        message: "product not found",
    });
});

app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    const product = products.find((product) => product.id === parseInt(id));
    products = products.filter((product) => product.id !== parseInt(id));

    if (product)
        return res.status(204).json({                //used for no content
            message: "Product deleted successfully",
        });
    return res.status(404).json({
        message: "product not found",
    });
});

app.listen(port, () => {
    console.log(`the server is running on port ${port}`);
});
