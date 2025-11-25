const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

const habitablePlanets = [];

const isHabitablePlanet = (planet) => {
  return (
    planet.koi_disposition === "CONFIRMED" &&
    planet.koi_insol > 0.36 &&
    planet.koi_insol < 1.11 &&
    planet.koi_prad < 1.6
  );
};

const loadPlanetsData = async () => {
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "../data/kepler_data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
          await savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.error(error);
        reject(error);
      })
      .on("end", async () => {
        const countPlanets = await getAllPlanets();
        console.log(`Found planets: ${countPlanets.length}`);
        // const bestPlanetCheck = habitablePlanets.find(
        //   (planet) => planet.kepler_name === "Kepler-442 b"
        // );
        // if (bestPlanetCheck) console.log(bestPlanetCheck);
        resolve();
      });
  });
};

async function getAllPlanets() {
  // console.log(habitablePlanets);
  // return habitablePlanets;
  return planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function savePlanet(planet) {
  try {
    const test = await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
    console.log(test);
  } catch (error) {
    console.error(`Could not save planet ${error}`);
  }
}

module.exports = { loadPlanetsData, getAllPlanets };
