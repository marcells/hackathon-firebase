const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.add = functions.https.onRequest(async (request, response) => {
    const startTime = new Date().toISOString();
    await admin.database().ref('/pomodoros/current/' + request.query.user).set({ startTime });

    response.send(200);
});

exports.delete = functions.https.onRequest(async (request, response) => {
    await admin.database().ref('/pomodoros/current/' + request.query.user).remove();

    response.send(200);
});

exports.list = functions.https.onRequest(async (request, response) => {
    const currentData = (await admin.database().ref('pomodoros/current').orderByChild('startTime').once('value')).toJSON();
    const lastData = (await admin.database().ref('pomodoros/last').orderByChild('startTime').once('value')).toJSON();

    console.log('Current:', currentData);
    console.log('LastData:', lastData);
    
    const convert = input =>
        input ? Object.keys(input).map(key => ({
            name: key,
            startTime: input[key].startTime,
            runningTime: new Date() - new Date(input[key].startTime)
        })) : [];


    response.send({
        current: convert(currentData),
        last: convert(lastData)
    });
});

exports.moveCurrent = functions.database.ref('/pomodoros/current/{user}')
    .onCreate(async (snapshot, context) => {
        console.log('sleep start ' + context.params.user)

        await sleep(10 * 1000)

        console.log('sleep done ' + context.params.user)

        await admin.database().ref('/pomodoros/current/' + context.params.user).remove();
        await admin.database().ref('/pomodoros/last/' + context.params.user).set(snapshot.val());
    })

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}