
//import * as functions from 'firebase-functions';
//import * as admin from "firebase-admin";
//import * as firebase from 'firebase';

const functions = require('firebase-functions');
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

const settings = { timestampsInSnapshots: true };
db.settings(settings);

exports.archiveChat = functions.firestore
  .document("chats/{chatId}")
  .onUpdate( (change) => {
    const data = change.after.data();

    const maxLen = 100;
    //ESTE IF QUE CIERRA ABAJO LO HE INCLUIDO YO
    if(data){
        const msgLen = data.messages.length;
        const charLen = JSON.stringify(data).length;

        const batch = db.batch();

    if (charLen >= 10000 || msgLen >= maxLen) {

      // Always delete at least 1 message
      const deleteCount = msgLen - maxLen <= 0 ? 1 : msgLen - maxLen
      data.messages.splice(0, deleteCount);

      const ref = db.collection("chats").doc(change.after.id);

      batch.set(ref, data, { merge: true });

      return batch.commit();
    } else {
      return null;
    }
}else {
    return null;
  }
  });


const callPush = async(tokens) => {
  const payload = {

    notification: {
      title: "co-lab ;-)",
      body: "¡hay actividad en tu grupo!", //aquí se puede poner el mensaje (message) pero hay que controlar si éste es una imagen...
      icon: "gs://co-talk.appspot.com/profileImagesStorage/drawable-ldpi-icon.png"

    },
    data: {
      //title: "nuevo data de co-lab",
      //body: message,
      //icon: "https://placeimg.com/250/250/people"
      //notification_foreground: false
    }
  };

  // Get the list of device tokens.
console.log('called', tokens);

  if (tokens.length > 0) {
    // Send notifications to all tokens.
    console.log('Notifications have been sent and tokens cleaned up.', tokens);
    return await admin.messaging().sendToDevice(tokens, payload);
  }else {
    return null;
  }
}


  exports.fcmSend = functions.firestore
  .document(`chats/{chatId}`).onUpdate(async(change, context) => {


    const messageArray = change.after.data().messages;
      const teamId = change.after.data().teamId;
    //const chatId  = context.params.chatId;
    //const messageTest = context.params.mId;
    // const message = messageArray[(messageArray.length-1)].content
    if (!change.after.data()) {
      return console.log(' user ' );
      }
    let usersId = [];
      let tokenList = [];
      db.collection("teams").doc(teamId).get().then(docRef => {
        console.log('ream data');
        let teamDetails = docRef.data();
        usersId.push(teamDetails.teamOwner);
        console.log('ream data user ids');
        for (let users of teamDetails.members) {
          console.log('ream data user ids all');
          if (users && users.uId && users.uId.length > 0) {
            usersId.push(users.uId);
          }
        }
        console.log(usersId);

            db.collection('devices').where("userId", "in", usersId).get().then(devices => {
              console.log('ream devices');

              devices.forEach(device => {
                const dev = device.data();
                tokenList.push(dev.token);

              });
                console.log(tokenList, 'tokenList');
                callPush(tokenList);
            }).catch();



        }).catch();
      })
