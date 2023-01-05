const fs = require('fs');
const uuid = require('uuid');

const data_json = JSON.parse(fs.readFileSync('./data.json', 'utf-8')); 

data_json.books.forEach(book => {
    book.id = uuid.v4();
});

const data_str = JSON.stringify(data_json);

fs.writeFile('./new_data.json', data_str, (err) => {
    console.log('writing finished');
})