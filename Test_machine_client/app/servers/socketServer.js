//requires
const test_machine_controller = require("../Controllers/controller.test_machine");
var myArgs = process.argv.slice(2);

//run the code in asynchronous fashion
const Main = () => {
  test_machine_controller.getMachineDetailsFromAccessCode(
    myArgs[0],
    runSocketServer
  );
};

//function to run socket server
const runSocketServer = (details) => {
  //run the rest of the code
  if (details === "not_found") {
    console.log("invalid access code!");
    return;
  }
  if (details === "an_error_occured") {
    console.log("an error happened!");
    return;
  }
  if (details !== undefined) {
    //info to be sent by the machine to the server on connection
    const machineInfo = {
      socketId: "",
      machineId: `${details.id}`,
      machineName: `${details.machine_name}`,
      macAddress: `${details.physical_id}`,
    };

    //setting up socket.io client
    const SocketConnection = require("socket.io-client");
    const socket = SocketConnection("http://localhost:4000"); //connect to the main server

    //send machine information to the main server on starting
    socket.emit("send-greeting", machineInfo);

    //
    socket.on("duplicate-connection", (arg) => {
      console.log(`${arg} - please try again!`);
      socket.disconnect();
    });
  }
};

//run the main function
Main();
