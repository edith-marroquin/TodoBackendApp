require('dotenv').config(); 
const express = require('express'); 
const { CosmosClient } = require('@azure/cosmos'); 
const path = require('path'); 
 
const app = express(); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 
 
// Cosmos DB Setup 
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING); 
const databaseId = 'TodoDB'; 
const containerId = 'Items'; 
let container; 
 
async function initCosmos() { 
    const { database } = await client.databases.createIfNotExists({ id: databaseId }); 
    const { container: resContainer } = await database.containers.createIfNotExists({ id: containerId }); 
    container = resContainer; 
    console.log("Cosmos DB connected."); 
} 
initCosmos().catch(console.error); 
 
// API Routes 
app.get('/api/todos', async (req, res) => { 
    const { resources } = await container.items.readAll().fetchAll(); 
    res.json(resources); 
}); 
 
app.post('/api/todos', async (req, res) => { 
    const newTodo = { text: req.body.text, done: false }; 
    const { resource } = await container.items.create(newTodo); 
    res.status(201).json(resource); 
}); 
 
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));