const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'data.csv',
  header: [
    { id: 'channel', title: 'Channel'},
    { id: 'action_type', title: 'Action type'},
    { id: 'userState', title: 'User State'},
    { id: 'content', title: 'Content'},
    { id: 'timestamp', title: 'Timestamp'},
  ]
});

const saveToCSV = data => {
  return csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully'));
};

module.exports = saveToCSV;