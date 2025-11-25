const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

// const launches = new Map();

let DEFAULT_LAUNCH_NUMBER = 100;

async function populateLaunches() {
  const response = await axios.post(
    "https://api.spacexdata.com/v4/launches/query",
    {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    }
  );

  if (response.status != 200) {
    console.error("Problem loading data");
    throw new Error(`launch_data_download_failed`);
  }

  const launchDocs = await response.data.docs;
  for (const launchDoc of launchDocs) {
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers: launchDoc.payloads.flatMap((payload) => payload.customers),
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };

    console.log(launch);

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("already populated");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return launchesDatabase.findOne(filter);
}

async function getAllLaunches(skip, limit) {
  return launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlight() {
  const latestLaunch = await launchesDatabase.findOne({}).sort("-flightNumber");

  if (!latestLaunch) return DEFAULT_LAUNCH_NUMBER;
  return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
  const foundPlanet = await planets.findOne(
    { keplerName: launch.target },
    { __v: 0, _id: 0 }
  );

  console.log(foundPlanet);

  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const latestFlight = await getLatestFlight();

  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("target_invald");
  }

  const newLaunch = Object.assign(launch, {
    customers: ["NASA"],
    upcoming: true,
    success: true,
    flightNumber: latestFlight + 1,
  });

  await saveLaunch(newLaunch);
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ["NASA"],
      upcoming: true,
      success: true,
    })
  );
}

async function existLaunchWithId(flightNumber) {
  return launchesDatabase.findOne({ flightNumber });
}

async function aboutLaunchById(flightNumber) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber },
    {
      upcoming: false,
      success: false,
    }
  );
  console.log(aborted);
  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  existLaunchWithId,
  aboutLaunchById,
  scheduleNewLaunch,
  loadLaunchData,
};
