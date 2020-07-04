const fs = require('fs');

const saveToFile = (data) => {
    return fs.writeFile('data.json', JSON.stringify(data), (err) => {
      if (err) throw err;

      console.log('Data written to a file');
  });
};

const saveToJSON = (queue) => {
  if (fs.existsSync('data.json')) {
    return new Promise((resolve, reject) => {
      fs.readFile('data.json', (err, data) => {
        if (err) return reject(err);

        let json = JSON.parse(data);
        json.push(...queue);

        return resolve(saveToFile(json));
      });

    })
  } else {
    return saveToFile(queue);
  }
};

module.exports = saveToJSON;