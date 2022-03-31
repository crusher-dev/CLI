import path from "path";
import { getMachineUUID } from "./appConfig";
var osu = require("node-os-utils");

const { Worker } = require("worker_threads");

export const telemetryWorker = new Worker(path.resolve(__dirname, "./telemetry.js"));

export const telemetry = async (data) => {
  const telemetryData = { anonymousId: getMachineUUID(), ...data };

  await pingMachineBasicDetails();

  telemetryWorker.postMessage({ type: "track", data: telemetryData });
};


export const alias = async (id) => {
  const data = {
    anonymousId: getMachineUUID(),
    userId: id,
  };
  telemetryWorker.postMessage({ type: "identify", data });
};

async function pingMachineBasicDetails() {
  const { platform } = process;

  var os = require("os");

  const cpu = os.cpus();
  const totalmen = os.totalmem() / (1024 * 1024 * 1024);
  const freemem = os.freemem() / (1024 * 1024 * 1024);

  const oos = await osu.os.oos();
  const arch = osu.os.arch();
  const type = osu.os.type();
  const ip = osu.os.ip();

  const telemetryData = {
    anonymousId: getMachineUUID(),
    event: "MACHINE_DETAILS",
    properties: {
      platform,
      cpu: cpu?.[0],
      totalmen,
      freemem,
      oos,
      arch,
      type,
      ip,
    },
  };

  telemetryWorker.postMessage({ type: "track", data: telemetryData });
}


export const exitGracefully = async () => {
  telemetryWorker.on("message",message => {
    if (message === "done") {
      setTimeout(() => {
        telemetryWorker.terminate()
      },1000)
    }
  });
  telemetryWorker.postMessage({ type: "flush", data: {} });
};