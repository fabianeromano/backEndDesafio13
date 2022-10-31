import fs from 'fs';
import path from 'path';

class MessageRepository {
    filename;

    constructor() {
        this.filename = 'messages.txt';
    }

    initFile() {
        const data = [];
        fs.writeFileSync(path.join("./", this.filename), JSON.stringify(data, null, 2));
    }

    save({
        author,
        text,
        datetime,
    }) {
        try {
            const messages = fs.readFileSync(path.join("./", this.filename), 'utf8');
            const parsedMessages = JSON.parse(messages);
            const updatedMessages = [...parsedMessages, { id: parsedMessages.length + 1, author, text, datetime }];
            fs.writeFileSync(path.join("./", this.filename), JSON.stringify(updatedMessages, null, 2));
        } catch (error) {
            throw new Error('Error inserting message: ' + error.message);
        }
    }

    getAll() {
        try {
            const messages = fs.readFileSync(path.join("./", this.filename), 'utf8');
            if (messages){
                return JSON.parse(messages);
            }
            else
                return [];
        } catch (err) {
            throw new Error('Error getting all messages: ' + err.message);
        };
    }
};

export const messageRepository = new MessageRepository()