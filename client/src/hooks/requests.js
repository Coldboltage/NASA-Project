const URL = process.env.REACT_APP_API_URL;

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${URL}/v1/planets`);
  const result = await response.json();
  console.log(result);
  return result;
}

async function httpgetAllLaunches() {
  // TODO: Once API is ready.
  const response = await fetch(`${URL}/v1/launches`);
  const result = await response.json();
  console.log(result);
  return result.sort((a, b) => a.flightNumber - b.flightNumber);
  // Load launches, sort by flight number, and return as JSON.
}

async function httpSubmitLaunch(launch) {
  try {
    return fetch(`${URL}/v1/launches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });
  } catch (error) {
    return { ok: false };
  }

  // Submit given launch data to launch system.
}

async function httpAbortLaunch(id) {
  try {
    return fetch(`${URL}/v1/launches/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      response: false,
    };
  }
  // TODO: Once API is ready.
  // Delete launch with given ID.
}

export {
  httpGetPlanets,
  httpgetAllLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};
