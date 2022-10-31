import * as mongoose from "mongoose";

export class MongoDbContainer {
    name;
    schema;
    model;
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
        this.model = mongoose.model(this.name, this.schema);
    }

    async save(nuevoObjeto) {
        try {
            const Model = mongoose.model(this.name, this.schema);
            const newDocument = new Model();
            Object.assign(newDocument, nuevoObjeto);
            return newDocument.save(function (err, doc) {
                if (err) throw err;
                else return doc;
            });
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }
    async getById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw new Error(`Error al buscar un producto por id: ${error}`);
        }
    }
    async getFiltered(filter) {
        try {
            return await this.model.findOne(filter).exec();
        } catch (error) {
            throw new Error(`Error al buscar un producto por id: ${error}`);
        }
    }
    async getAll() {
        try {
            return await this.model.find();
        } catch (error) {
            return []
        }
    }
    async deleteById(id) {
        try {
            await this.model.deleteOne({ id });
        } catch (error) {
            throw new Error(`Error while deleting.`);
        }
    }
    async updateById(id, data) {
        try {
            await this.model.findOneAndUpdate({ id, data });
        } catch (error) {
            throw new Error(`Error while deleting.`);
        }
    }
    async deleteAll() {
        try {
            await this.model.deleteMany();
        } catch (error) {
            throw new Error(error?.message);
        }
    }
}