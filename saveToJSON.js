const fs = require('fs');

const saveToFile = (data) => {
  fs.writeFile('data.json', JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('Data written to a file');
  });
};

const saveToJSON = (queue) => {
  if (fs.existsSync('data.json')) {
    fs.readFile('data.json', (err, data) => {
      let json = JSON.parse(data);
      json.push(...queue);
      
      saveToFile(json);
    });
  } else {
    saveToFile(queue);
  }
};

module.exports = saveToJSON;