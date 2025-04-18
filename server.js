
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const orderModel = require('./orderModel');
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000

const app = express();
app.use(cors());
app.use(express.json());

// const uri = "mongodb+srv://islamnasir910:ecommercenaz@cl.vqpdy.mongodb.net/?retryWrites=true&w=majority&appName=Cl";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db('ecom');
const user = database.collection('user');
const clients = database.collection('clients');

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ping: 1});
    console.log(("Pinged your deployment. You successfully connected to MongoDB!"));
  } catch (error) {
    console.error("MongoDB Connection Error: ",error);
  }
}

run().catch(console.dir);

app.get('/',(req,res) =>{
  res.send("hello Nazmul hassan");
 
});

app.get('/user', async (req,res) =>{
  try {
    let product = (await user.find({}).toArray()).reverse();
    res.send({...product});
  } catch (error) {
    res.status(500).send("Error:"+error);
  }
})

app.post('/user', async (req,res) =>{
  try {
    console.log("Hellow Nazmul",req.body)

    const {title,description,price,imgUrl,quantity,category} = req.body;

    if(!title || !description || !price || !imgUrl || !quantity || !category){
      res.json("Title Description Price ImgUrl Quantity and Category are required!");
    }

    const productObj = {
      title: title,
      description: description,
      price: price,
      imgUrl: imgUrl,
      quantity: quantity,
      category: category
    }

    let product = await user.insertOne(productObj);

    res.status(201).json({
      message:"Product added successfully!",
      ...productObj
    })

  } catch (error) {
    res.status(400).send("Error:" + error);
  }
})

app.delete('/user/:id',async (req,res) =>{
  const {id} = req.params;
  try {
    const result = await user.deleteOne({_id: new ObjectId(id)});
    if(result.deletedCount === 0){
      return res.send("Product not found");
    }
    res.send({message:'Product is deleted successfully'});
  } catch (error) {
    res.send("Error from Delete api in server",error);
  }

})

app.put('/user/:id', async (req,res) =>{
  const {id} = req.params;
  const {title,description,price,imgUrl,category} = req.body;

  try {
    let updateProduct = {};

    if(!title || !description || !price || !imgUrl || !category){
      return res.send(400).json({message:"Not any one data change!"});
    }
    if( title || description || price || imgUrl || category){
      updateProduct.title = title;
      updateProduct.description = description;
      updateProduct.price = price;
      updateProduct.imgUrl = imgUrl;
      updateProduct.category = category;
    }

    const result = await user.updateOne(
      {_id: new ObjectId(id)},
      {$set: updateProduct}
    );

    if(result.matchedCount === 0){
      return res.status(404).json({message:"Product not found!!"});
    }

    res.json({message:"Product Updated successfully",...updateProduct});

  } catch (error) {
    res.status(500).json("Error",error);
  }

})

app.get('/user/:key',async (req,res) =>{
  let data = await user.find(
    {
      "$or":[
        {title:{$regex:req.params.key, $options:"i"}}
      ]
    }
  )
  res.send(data);
})


// client route

app.get('/client', async (req,res) =>{
  try {
    let product = (await clients.find({}).toArray()).reverse();
    res.send({...product});
  } catch (error) {
    res.status(500).send("Error:"+error);
  }
})

app.post('/client',async(req,res) =>{
  try {
    const {products,total} = req.body;

    const newOrder = new orderModel({
      products,
      total,
    });

    const savedOrder = await clients.insertOne(newOrder);
    res.status(201).json({
      message:"Product orderd successfully!",
      ...savedOrder
    })

  } catch (error) {
    res.status(500).json({ error: 'Failed to save order' });
  }
})

app.listen(port,()=>{
  console.log(`Application listening on Port ${port}`);
})