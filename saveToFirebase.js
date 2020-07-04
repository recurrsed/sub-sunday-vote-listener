const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json");

const saveToFirebase = (chatData) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://twitchsniffer-25e09.firebaseio.com"
  });
  const rootRef = admin.database().ref('/chat/ZpcM8kKeNEOnH8ovBniT');
  const promises = [];

  console.log('Firebase initialized...');

  (chatData || []).forEach((item) => {
    promises.push(rootRef.child(item.userstate['user-id']).set(item));
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