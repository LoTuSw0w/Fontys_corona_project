//importing NPM and database
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");

let currentConnectedMachineArray = [];

io.on("connection", (socket) => {
  //receive test machine information on connection
  socket.on("send-greeting", (machine_info) => {
    if (!checkIfAMachineHasAlreadyConnected(machine_info)) {
      LogAndSaveMachineObject(machine_info, socket);
    } else {
      socket.emit("duplicate-connection", "duplicate connection!");
    }
  });

  //when a test machine disconnects
  socket.on("disconnect", () => {
    //find the index of the going-to-be-removed testing machine
    DeleteMachineObjectFromArrayWithSocketId(socket);
  });
  //receive test data in real-time
  socket.on("test_data", (data) => {
    console.log(data);
  });
});

//listen on port 4000
http.listen(4000, () => {
  console.log("Main server is running");
});

///////////////
///////////////

const checkIfAMachineHasAlreadyConnected = (machine) => {
  const index = currentConnectedMachineArray.findIndex(
    (testingMachine) => testingMachine.machineId === `${machine.machineId}`
  );
  //-1 indicates that this this connection is a new connection
  if (index === -1) {
    return false;
  }
  //if a machine with similar information has already been connected, this means that we should cut the connection
  else {
    return true;
  }
};

const LogAndSaveMachineObject = (machine_info, socket) => {
  //get the socket ID assigned by Socket.io
  machine_info.socketId = socket.id;
  //log the info received
  console.log(
    `${machine_info.machineName} with address ${machine_info.macAddress} has connected! - assigned with socket ID: ${socket.id}`
  );
  //push the object to the array of machine objects
  currentConnectedMachineArray.push(machine_info);
  //write to log file
  writeCurrentlyConnectedMachineIdToFile(machine_info.machineId);
};

const DeleteMachineObjectFromArrayWithSocketId = (socket) => {
  const index = currentConnectedMachineArray.findIndex(
    (testingMachine) => testingMachine.socketId === `${socket.id}`
  );
  if (index === -1) {
    //the server needs to do nothing since it is a duplicate connection
  } else {
    //save the object to another variable for displaying purpose
    const machineToBeRemoved = currentConnectedMachineArray[index];
    //remove from log file
    deleteMachineIdFromLogFile(machineToBeRemoved.machineId);
    //remove the object from the array
    if (index !== undefined) currentConnectedMachineArray.splice(index, 1);
    //display the information
    console.log(
      `${machineToBeRemoved.machineName} has disconnected! - ` + socket.id
    );
  }
};

const deleteMachineIdFromLogFile = (machineId) => {
  const directory = "app/Controllers/Logs/currentlyConnectedMachine.txt";
  fs.readFile(directory, (err) => {
    if (err) throw error;
    let dataArray = fs.readFileSync(directory, "utf8").split("\n"); // convert file data in an array
    const index = dataArray.findIndex((line) => line === `${machineId}`);
    console.log(index);
    if (index !== -1) {
      dataArray.splice(index, 1); // remove the matching id from the data Array
      // update the file with new data
      const updatedData = dataArray.join("\n");
      fs.writeFile(directory, updatedData, (err) => {
        if (err) throw err;
        console.log("Successfully updated the file data");
      });
      return true;
    } else {
      console.log("somehow the id is not in the file!");
      return false;
    }
  });
};

const writeCurrentlyConnectedMachineIdToFile = (machineId) => {
  const directory = "app/Controllers/Logs/currentlyConnectedMachine.txt";
  fs.appendFile(directory, `${machineId}\n`, (err) => {
    if (err) throw err;
  });
};
