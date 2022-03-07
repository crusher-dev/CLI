import { getMachineUUID } from "./appConfig";

const Analytics = require('analytics-node');
var osu = require('node-os-utils')

var cpu = osu.cpu

const client = new Analytics(process.env.ANALYTICS_ID || "IM0t0F7DFPxWwbDrd8WStLqOjJYLYuaq");

export const telemetry = (data) => {
  client.track({    userId: getMachineUUID(),
    ...data
  });

  pingMachineBasicDetails();

}

export const alias = (email) => {
  client.alias({
    "previousId": getMachineUUID(),
    "userId": email
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
    userId: getMachineUUID(),
    event: 'MACHINE_DETAILS',
    properties: {
      platform, cpu: cpu?.[0], totalmen, freemem,
       oos,
      arch, type, ip
    },
  });
}

