const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json");

function getWeekNumber(d = new Date()) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  d.setMilliseconds(0);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return weekNo;
}

const saveToFirebase = (chatData) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://twitchsniffer-25e09.firebaseio.com"
    });
  }

  const thisWeekRef = admin.database().ref(`/chat/${getWeekNumber()}`);
  const promises = [];

  console.log('Firebase initialized...');

  (chatData || []).forEach((item) => {
    promises.push(thisWeekRef.child(item.userstate['user-id']).set(item));
  });

  return Promise.all(promises)
    .then(() => console.log('Data saved.'))
    .catch((error) => {
      console.error(error);
      admin.app().delete();
    })
    .finally(() => {
      console.log('DB connection closed...');
      return admin.app().delete();
    });
};

module.exports = saveToFirebase;