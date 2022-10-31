export const messagesConfig = {
    client: 'sqlite3',
    connection: {
        filename: './messages.sqlite'
    },
    useNullAsDefault: true
};

export const productosConfig = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'strapi',
        database: 'test',
    }
};

