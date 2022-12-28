const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const Query = `
    SELECT
      *
    FROM
     cricket_team;`;
  const output = await db.all(Query);
  const result = [];
  for (let i of output) {
    let k = convertDbObjectToResponseObject(i);
    result.push(k);
  }
  response.send(result);
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const Query = `insert into cricket_team (playerName,jerseyNumber,role) values (${playerName},${jerseyNumber},${role});`;
  try {
    const result = await db.all(Query);
    response.send("Player Added to Team");
  } catch (err) {
    response.send("error occured");
  }
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const Query = `
    SELECT
      *
    FROM
     cricket_team where player_Id=${playerId};`;
  const output = await db.all(Query);
  response.send(output);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const Query = `update cricket_team set player_name=${playerName},jersey_number=${jerseyNumber},role=${role} ;`;
  const output = await db.all(Query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const Query = `
   delete from cricket_team where player_Id=${playerId};`;
  const output = await db.all(Query);
  response.send("Player Removed");
});

module.exports = express;
