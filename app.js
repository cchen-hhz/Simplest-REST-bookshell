import express from 'express';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});
app.get('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/search', (req, res) => {
    fs.readFile(__dirname + '/books.json', 'utf8' ,(err, data) => {
        if(err) {
            console.log("An error occurred while reading the file.");
            console.log(err);
            res.end("Error");
            return;
        }
        console.log('Books data read from file');
        let books = JSON.parse(data);
        console.log(req.query.id);
        if(req.query.id) {
            let book = books.find(b => b.uid == req.query.id);
            if(book) {
                res.send(book);
            }
            else {
                res.end("Book not found");
            }
        }
        else {
            res.send(books);
            //res.end();
        }
    });
});

app.post('/add', (req, res) => {
    console.log("Adding book");
    fs.readFile(__dirname + '/books.json', 'utf8', (err, data) => {
        if(err) {
            console.log("An error occurred while reading the file.");
            console.log(err);
            res.end("Error");
            return;
        }
        let books = JSON.parse(data);
        let newBook = req.body;
        let uid = newBook.uid;
        if(books.find(b => b.uid == uid)) {
            res.end("Book already exists");
            return;
        }
        books.push(newBook);
        fs.writeFile(__dirname + '/books.json', JSON.stringify(books), (err) => {
            if(err) {
                console.log("An error occurred while writing the file.");
                console.log(err);
                res.end("Error");
                return;
            }
            console.log("Book added successfully");
            res.write(JSON.stringify(newBook)+'\n');
            res.end("Book added successfully");
        });
    });
});

app.get('/deleteBook', (req, res) => {
    const uid = req.query.uid;
    console.log("Deleting book with uid: " + uid);
    fs.readFile(__dirname + '/books.json', 'utf8', (err, data) => {
        if (err) {
            console.log("An error occurred while reading the file.");
            console.log(err);
            res.end("Error");
            return;
        }
        let books = JSON.parse(data);
        const index = books.findIndex(b => b.uid == uid);
        const deletedBook = books[index];
        if (index === -1) {
            res.end("Book not found");
            return;
        }
        books.splice(index, 1);
        fs.writeFile(__dirname + '/books.json', JSON.stringify(books), (err) => {
            if (err) {
                console.log("An error occurred while writing the file.");
                console.log(err);
                res.end("Error");
                return;
            }
            res.write(JSON.stringify(deletedBook) + '\n');
            console.log("Book deleted successfully");
            res.end("Book deleted successfully");
        });
    });
});

let server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

