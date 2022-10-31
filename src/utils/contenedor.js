const { promises: fs } = require("fs")

class Contenedor {
    constructor(ruta) {
        this.ruta = ruta
    }


    async save(nuevoObjeto) {
        try {
            const objetos = await this.getAll()
            let newId
            if (objetos.length == 0) {
                newId = 1
            } else {
                const ultimoId = parseInt(objetos[objetos.length - 1].id)
                newId = ultimoId + 1;
            }

            objetos.push({ ...nuevoObjeto, id: newId })

            await fs.writeFile(this.ruta, JSON.stringify(objetos, null, 2))
            return newId
        } catch (error) {
            throw new Error(`Error al guardar: ${error}`)
        }
    }
    async getById(id) {
        try {
            const objetos = await this.getAll();
            const filtrarObjetos = objetos.find((elem) => elem.id === id);
            const response = filtrarObjetos === undefined ? null : filtrarObjetos;
            return response;
        } catch (error) {
            throw new Error(`Error al buscar un producto por id: ${error}`);
        }
    }
    async getAll() {
        try {
            const objetos = await fs.readFile(this.ruta, "utf-8")
            return JSON.parse(objetos)
        } catch (error) {
            return []
        }
    }
    async deleteById(id) {
        try {
            const objetos = await this.getAll();
            const nuevoDato = objetos.filter((elem) => elem.id !== id);
            if (nuevoDato.length === objetos.length) {
                throw new Error(`Error while deleting. The id: ${id} was not found.`);
            }
            await fs.writeFile(this.ruta, JSON.stringify(objetos, null, 2))
        } catch (error) {
            throw new Error(`Error while deleting.`);
        }
    }
    async deleteAll() {
        try {
            const content = [];
            await fs.writeFile(this.ruta, JSON.stringify(content, null, 2))
        } catch (error) {
            throw new Error(error);
        }
    }
}

const contenedor = new Contenedor(__dirname + '/../../productos.txt');

module.exports = contenedor;