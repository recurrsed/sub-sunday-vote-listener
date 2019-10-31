const tmi = require('tmi.js');
const cron = require('node-cron');
const config = require('./config');
const saveToCSV = require('./saveToCSV');

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

  pushToQueue({ channel, action_type: userstate['message-type'], userState: JSON.stringify(userstate), content: JSON.stringify({ message }) });
};

const onCheer = (channel, userstate, message) => {
  pushToQueue({ channel, action_type: 'onCheer', userState: JSON.stringify(userstate), content: JSON.stringify({ message }) });
};

// Gifts
const onContinueGiftSub = (channel, username, userstate) => {
  pushToQueue({ channel, action_type: 'onContinueGiftSub', userState: JSON.stringify(userstate), content: JSON.stringify({}) });
};

const onSubGift = (channel, username, streakMonths, recipient, methods, userstate) => {
  // let senderCount = ~~userstate["msg-param-sender-count"];
  pushToQueue({ channel, action_type: 'onSubGift', userState: JSON.stringify(userstate), content: JSON.stringify({ streakMonths, recipient, methods }) });
};

const onAnonymusSubGift = (channel, username, numbOfSubs, methods, userstate) => {
  // let senderCount = ~~userstate["msg-param-sender-count"];
  pushToQueue({ channel, action_type: 'onAnonymusSubGift', userState: JSON.stringify(userstate), content: JSON.stringify({ numbOfSubs, methods }) });
};

// Subs
const onSubscribed = (channel, username, method, message, userstate) => {
  pushToQueue({ channel, action_type: 'onSubscribed', userState: JSON.stringify(userstate), content: JSON.stringify({ message, method }) });
};

const onResub = (channel, username, months, message, userstate, methods) => {
  let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];

  pushToQueue({ channel, action_type: 'onResub', userState: JSON.stringify(userstate), content: JSON.stringify({ months, message, methods, cumulativeMonths }) });
};

// Punishments
const onTimeout = (channel, username, reason, duration, userstate) => {
  pushToQueue({ channel, action_type: 'onTimeout', userState: JSON.stringify(userstate), content: JSON.stringify({ reason, duration }) });
};

const onBan = (channel, username, reason, userstate) => {
  pushToQueue({ channel, action_type: 'onBan', userState: JSON.stringify(userstate), content: JSON.stringify({ reason }) });
};

const onConnectedHandler = (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`);
};

// Create a client with our options
const client = new tmi.client(config);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on("ban", onBan);
client.on("cheer", onCheer);
client.on("timeout", onTimeout);
// Subs
client.on("resub", onResub);
client.on("subgift", onSubGift);
client.on("subscription", onSubscribed);
client.on("submysterygift", onAnonymusSubGift);
client.on("anongiftpaidupgrade", onContinueGiftSub);

// Connect to Twitch:
client.connect();

cron.schedule('*/3 * * * *', () => {
  console.log('Saving data...', new Date().toLocaleString());

  saveToCSV(QUEUE)
    .then(() => {
      QUEUE = [];
      console.log('QUEUE', QUEUE);
    });
});
