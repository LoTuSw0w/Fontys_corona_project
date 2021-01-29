const socket = require('socket.io-client')('http://localhost:4000');
const testResult = require('./test_result');

const sendTest = () => {
    const result = new testResult({
        time_and_date: new Date().toLocaleString().replace(',',''),
        test_link_code: 1234566788,
        device_number: 1,
        test_area_id: 2,
        result: 0
    });
    socket.emit('test_data', result);
    return;
}

setTimeout(sendTest,2000);