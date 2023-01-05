//Setting up modules and packages
const express = require('express');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');

// Setting up an express server in the APP const
const app = express();
const urlParser = bodyParser.urlencoded({extended: false});

// Constant values for connection
const PORT = 3000;
const HOSTNAME = 'localhost';

const data_json = JSON.parse(fs.readFileSync('./new_data.json', 'utf-8'));
data_json.book_count = data_json.books.length;

const isValid = (new_book) => {
    return Object.hasOwn(new_book, 'id');
};

const isValidProp = (new_book, props) => {
    props.forEach(prop => {
        if(!Object.hasOwn(new_book, prop)) return false;
    });
    return true;
}

const isExist = (arg, new_book) => {
    switch(arg){
        case "title":
            return !_.isEmpty(data_json.books.find(({title}) => title === new_book.title));
        case "id":
            return !_.isEmpty(data_json.books.find(({id}) => id === new_book.id));
    }
    
};

const writeDataFile = (argData) => {
    data_json.book_count = data_json.books.length;
    fs.writeFile('./new_data.json', JSON.stringify(argData), (err) => {
        if(err) console.log(err);
    });
}
 
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server is listening on http://${HOSTNAME}:${PORT}/`);
});

app.get('/books', (req, res) => {
    if(_.isEmpty(req.query)) {
        res.send(data_json.books)
    } else {
        const results = [];
        const qProp = Object.getOwnPropertyNames(req.query);
        const qVal = Object.values(req.query);
        console.log(qProp, qVal);
        data_json.books.forEach(book => {
            let qCheck = 0;
            for(i = 0; i < qProp.length; i++){
                if(book[qProp[i]] == qVal[i]) qCheck++;
            }
            if(qCheck === qProp.length) {
                results.push(book);
                console.log('added');
            };            
        });
        _.isEmpty(results) ? res.send('Not Found') : res.send(results);
    }
});

app.post('/books', urlParser, (req, res) => {
    console.log(req.body);
    if(isValid(req.body)) {
        if(isExist('title',req.body)) res.send('Already in the library')
        else {
            data_json.books.push(req.body);
            writeDataFile(data_json);
            console.log("Successfully added a new book")
            res.send('Request sumbitted');
        }
    } else res.send('Invalid data');
});

app.delete('/books/:id', (req, res) => {
    console.log(req.method, req.params.id);
    if(isExist('id', req.params)) {
        res.send('Deleted successfuly');
        data_json.books = data_json.books.filter(({id}) => id!== req.params.id);
        writeDataFile(data_json);
    } else res.send('ID does not seem to exist');
});

app.patch('/books/:id', urlParser, (req, res) => {
    console.log(req.method, req.params.id, '\n', req.body);
    if(isExist('id', req.params)) {
        qProp = Object.getOwnPropertyNames(req.body);
        qVal = Object.values(req.body);

        if(!isValidProp(data_json, qProp)) res.send('Not valid property!');
        else {
            console.log('Valid property');
            for(i = 0; i < qProp.length; i++){
                const patch_book_index = data_json.books.findIndex(({id}) => id === req.params.id);
                data_json.books[patch_book_index][qProp[i]] = qVal[i];
            }
            writeDataFile(data_json);
            console.log(data_json);
            console.log(qProp, ' ----> ', qVal);
            res.send('Book has been updated.');
        }
    } else {
        res.send('Book has not been found. Check ID again.')
    }
});

app.use((req, res) => {
     res.status(404);
     res.send('Error 404 \n Page not found');
});