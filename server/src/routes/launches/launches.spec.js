const request = require("supertest");
const app = require("../../app");

const { connectDB, disconnect } = require("../../utils/connect");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
    await connectDB();
    await loadPlanetsData();
  });
  afterAll(async () => {
    await disconnect();
  });
  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "help",
      rocket: "helpBOOOM",
      target: "Kepler-1652 b",
      launchDate: "Feburary 28, 1991",
    };

    const launchDatwithoutData = {
      mission: "help",
      rocket: "helpBOOOM",
      target: "Kepler-1652 b",
    };

    const brokeDate = {
      mission: "help",
      rocket: "helpBOOOM",
      target: "Kepler-1652 b",
      launchDate: "Hello",
    };
    test("It should response with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDatwithoutData);
    });
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDatwithoutData)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "missing_required_launch_property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(brokeDate)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "invalid_launch_date",
      });
    });
  });
});
