// The event loop stop when creating test, this is wrapper on top of worker
// Segment relies on event loop to flush data, We're bypassing it.

const { workerData, parentPort } = require("worker_threads");
const Analytics = require("analytics-node");

const client = new Analytics(
  process.env.ANALYTICS_ID || "IM0t0F7DFPxWwbDrd8WStLqOjJYLYuaq",
  {
    flushAt: 1
  }
);

parentPort.on("message", (dataFromParent) => {
    trackInWorker(dataFromParent);
});

function trackInWorker(dataFromParent) {
  const { type, data } = dataFromParent;
  switch (type) {
    case "identify":
      client.identify(data);
      break;
    case "track":
      client.track(data);
          break;
      case "flush":
          client.flush((err, batch) => {
            parentPort.postMessage("done")
       })
  }
}
