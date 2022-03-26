import { getMachineUUID } from "./appConfig";

const Analytics = require('analytics-node');
var osu = require('node-os-utils')

const client = new Analytics(process.env.ANALYTICS_ID || "IM0t0F7DFPxWwbDrd8WStLqOjJYLYuaq", {
  flushInterval: 5
});

export const telemetry = (data) => {
  client.track({
    anonymousId: getMachineUUID(),
    ...data
  });

  pingMachineBasicDetails();

}

export const alias = (id) => {
  client.identify({
    "anonymousId": getMachineUUID(),
    "userId": id
  })
}

async function pingMachineBasicDetails() {
  const { platform } = process;

  var os = require('os');

  const cpu = os.cpus();
  const totalmen = os.totalmem()/(1024 * 1024 * 1024);
  const freemem = os.freemem()/(1024 * 1024 * 1024)


   const oos = await osu.os.oos()
  const arch = osu.os.arch()
  const type = osu.os.type()
  const ip = osu.os.ip()

  client.track({
    anonymousId: getMachineUUID(),
    event: 'MACHINE_DETAILS',
    properties: {
      platform, cpu: cpu?.[0], totalmen, freemem,
       oos,
      arch, type, ip
    },
  });
}

