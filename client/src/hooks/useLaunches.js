import { useCallback, useEffect, useState } from "react";

import {
  httpgetAllLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
} from "./requests";

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([]);
  const [isPendingLaunch, setPendingLaunch] = useState(false);

  const getAllLaunches = useCallback(async () => {
    const fetchedLaunches = await httpgetAllLaunches();
    saveLaunches(fetchedLaunches);
  }, []);

  useEffect(() => {
    getAllLaunches();
  }, [getAllLaunches]);

  const submitLaunch = useCallback(
    async (e) => {
      e.preventDefault();
      // setPendingLaunch(true);
      const data = new FormData(e.target);
      const launchDate = new Date(data.get("launch-day"));
      const mission = data.get("mission-name");
      const rocket = data.get("rocket-name");
      const target = data.get("planets-selector");
      const response = await httpSubmitLaunch({
        launchDate,
        mission,
        rocket,
        target,
      });

      // TODO: Set success based on response.
      const success = response.ok;
      if (success) {
        getAllLaunches();
        setTimeout(() => {
          setPendingLaunch(false);
          onSuccessSound();
        }, 800);
      } else {
        onFailureSound();
      }
    },
    [getAllLaunches, onSuccessSound, onFailureSound]
  );

  const abortLaunch = useCallback(
    async (id) => {
      const response = await httpAbortLaunch(id);

      // TODO: Set success based on response.
      const success = response.ok;
      if (success) {
        getAllLaunches();
        onAbortSound();
      } else {
        onFailureSound();
      }
    },
    [getAllLaunches, onAbortSound, onFailureSound]
  );

  return {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch,
  };
}

export default useLaunches;
