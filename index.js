const tmi = require('tmi.js');
const cron = require('node-cron');
const config = require('./config');
const saveToFirebase = require('./saveToFirebase');

let QUEUE = [];

/**
 * 
 * @param {Object} data - { channel_id: string, action_type: string, userState: any, content: any }
 */
const pushToQueue = (data) => QUEUE.push({ ...data, timestamp: new Date().toLocaleString() });

// Called every time a message comes in
const onMessageHandler = (channel, userstate, message, self) => {
  // Don't listen to my own messages..
  if (self) return;

  if (message.match(/^!vote \w/)) {
    pushToQueue({ userstate, message });
  }
};

// Create a client with our options
const client = new tmi.client(config);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);

// Connect to Twitch:
client.connect();

cron.schedule('*/5 * * * *', () => {
  console.log('Task running...');

  if (QUEUE.length) {
    console.log('Saving data...', new Date().toLocaleString());

    saveToFirebase(QUEUE).then(() => QUEUE = []);
  } else {
    console.log("No data to save.")
  }
});
