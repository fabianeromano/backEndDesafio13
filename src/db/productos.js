import knex from 'knex'
import { productosConfig } from './config.js';

const db = knex(productosConfig);

class ProductosRepository {
    tableName;

    constructor() {
        this.tableName = 'productos';
    }

    async createTable(){
        await db.schema.dropTableIfExists(this.tableName);
        await db.schema.createTable(this.tableName, function (table) {
            table.increments();
            table.string('title');
            table.double('price');
            table.string('thumbnail');
          })
    }

    async save({
        title,
        price,
        thumbnail,
    }) {
        try {
            await db(this.tableName).insert({ title, price, thumbnail })
        } catch (error) {
            throw new Error('Error inserting products: ' + error.message);
        }
    }

    async getAll() {
        try{
            return await db.from(this.tableName).select("*");
        } catch(err){
            throw new Error('Error getting all products: ' + err.message);
        };
    }
};

export const productosRepository = new ProductosRepository()