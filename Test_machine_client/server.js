const app = require('express')();
var http = require('http').createServer(app);
const io = require('socket.io')(http);
const crypto = require('crypto');


// const text = "to be hashed!!";
// const key = new Date().toLocaleString().replace(',','');
// const hashed = crypto.createHmac('sha256', key).update(text).digest('hex');

app.get('/', (req,res) => {res.sendFile(__dirname + '/index.html');});

io.on('connection', (socket) => {
    console.log("new test machine connected!");
    socket.on('disconnect', () => {
        console.log('test machine disconnected!');
    });
    socket.on('test_data', (data) => {
        console.log(data);
    })
});

http.listen(4000, () => {
    console.log("test machine service is running on port 4000!");
});




