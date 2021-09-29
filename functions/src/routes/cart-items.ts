import express from 'express';
import { ObjectId } from 'mongodb';
import { getClient } from '../db';
import Item from '../models/Item';

//creates a new router object
const routes = express.Router();

// GET /cart-items
routes.get("/cart-items", async (req, res) => {
  const maxPrice: number = Number(req.query.maxPrice);
  const product: string = req.query.product as string;
  const pageSize: number = parseInt(req.query.pageSize as string);

  let query: any = {};

  if (!isNaN(maxPrice)) {
    query = { price: { $lte: maxPrice } };
  }
  if (product) {
    query = { product: product };
  }

  try {
    const client = await getClient();
    if (!isNaN(pageSize)) {
      const results = await client.db().collection<Item>("cartItems")
            .find(query).limit(pageSize).toArray();
      res.json(results);
    } else {
      const results = await client.db().collection<Item>("cartItems")
            .find(query).toArray();
      res.json(results);
    }
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({"message": "Internal Server Error"});
  }
});

// GET /cart-items/:id
routes.get("/cart-items/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const client = await getClient();
    const result = await client.db().collection<Item>("cartItems")
        .findOne({_id: new ObjectId(id)});
    if (result) {
      res.json(result);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({"message": "Internal Server Error"});
  }
});

routes.post("/cart-items", async (req, res) => {
  const item: Item = req.body;
  try {
    const client = await getClient();
    await client.db().collection<Item>("cartItems").find().toArray();
    res.status(201);
    res.json(item);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({"message": "Internal Server Error"});
  }
});

routes.get("/products/highest-price", async (req, res) => {
  try {
    const client = await getClient();
    const results = await client.db().collection<Item>("cartItems")
          .aggregate([
            // stages go here!
          ]).toArray();
    res.json(results);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({"message": "Internal Server Error"});
  }
})

export default routes;