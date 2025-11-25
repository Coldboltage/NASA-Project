const {
  getAllLaunches,
  addNewLaunch,
  existLaunchWithId,
  aboutLaunchById,
  scheduleNewLaunch,
} = require("../../models/launches.model");

const { getPagination } = require("../../utils/query.js");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);

  res.status(200).json(launches);
}

async function httpaddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "missing_required_launch_property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (launch.launchDate.toString() == "Invalid Date") {
    return res.status(400).json({
      error: "invalid_launch_date",
    });
  }

  console.log(req.body);

  try {
    await scheduleNewLaunch(launch);
  } catch (error) {
    throw new Error(error);
  }

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;

  console.log(launchId);

  const launch = await existLaunchWithId(launchId);
  console.log(launch);

  if (await existLaunchWithId(launchId)) {
    const aborted = await aboutLaunchById(launchId);
    console.log(aborted);
    if (!aborted) {
      return res.status(400).json({ error: "launch_not_aborted" });
    } else {
      return res.status(200).json({ ok: aborted });
    }
  } else {
    return res.status(400).json({
      error: "launch_not_found",
    });
  }
}

module.exports = {
  httpGetAllLaunches,
  httpaddNewLaunch,
  httpAbortLaunch,
};
