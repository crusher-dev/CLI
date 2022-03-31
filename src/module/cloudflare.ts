import { downloadFile } from "../utils/common";
import cli from "cli-ux";
import { resolvePathToAppDirectory } from "../utils/utils";
import { execSync } from "child_process";
import path from "path";
import { getProjectConfig } from "../utils/projectConfig";
import { getAppConfig } from "../utils/appConfig";
import { CLOUDFLARED_URL } from "../constants";

var { spawn, exec } = require("child_process");
const fs = require("fs");

async function installNSetupOnMac() {
  const recorderZipPath = resolvePathToAppDirectory(`cloudflare.tgz`);
  const bar = cli.progress({
    format: `Downloading cloudflare tunnel {percentage}%`,
  });

  bar.start(100, 0, { speed: "N/A" });

  await downloadFile(CLOUDFLARED_URL.MAC, recorderZipPath, bar);

  execSync(
    `cd ${path.dirname(recorderZipPath)} && tar -xvzf ${path.basename(
      recorderZipPath
    )} && rm -R ${path.basename(
      recorderZipPath
    )} && mv cloudflared bin/cloudflared`,
    { stdio: "ignore" }
  );
}

async function installLinuxBuild() {
  const recorderZipPath = resolvePathToAppDirectory(`bin/cloudflared`);
  const bar = cli.progress({
    format: `Downloading cloudflare tunnel {percentage}%`,
  });

  bar.start(100, 0, { speed: "N/A" });

  await downloadFile(CLOUDFLARED_URL.LINUX, recorderZipPath, bar);
  execSync(`cd ${path.dirname(recorderZipPath)}  `, { stdio: "ignore" });

  // await new Promise((res, rej) => {
  //   setTimeout(res, 50);
  // });
}

async function setupCloudflare() {
  if (process.platform === "darwin") {
    await installNSetupOnMac();
  } else if (process.platform === "linux") {
    await installLinuxBuild();
  }
}
export class Cloudflare {
  static async install() {
    await setupCloudflare();
  }

  static runTunnel() {
    return new Promise(async (resolve, rej) => {
      const cloudflareDFile = resolvePathToAppDirectory("bin/cloudflared");
      if (!fs.existsSync(cloudflareDFile)) {
        console.log("Downloading cloudflared");
        await Cloudflare.install();
      }

      var data = getProjectConfig().proxy;
      const status = {};
      const tunnelPromises = data.map(({ name, url }) => {
        return new Promise((res, rej) => {
          var spann;
          try {
            spann = spawn(resolvePathToAppDirectory(`bin/cloudflared`), [
              `tunnel`,`--url`,`${url}`
            ]);

            console.log("URL",resolvePathToAppDirectory(`bin/cloudflared`), [
              `tunnel --url ${url}`,
            ])
          } catch (e) {
            console.log("error", e);
          }

          spann.stdout.on("data", function (msg) {
            console.log(msg.toString());
          });
          spann.stderr.on("data", function (msg) {
            const msgInString = msg.toString();
             console.log(msgInString)
            if (msgInString.includes("trycloudflare")) {
              const regex = /https.*trycloudflare.com/g;
              const found = msgInString.match(regex);
              if (!!found) {
                status[name] = { url: found };

                res("One tunnel created");
                console.log(`${name} - ${url} is ${found}`);
              }
            }
          });
        });
      });

      await Promise.all(tunnelPromises);

       resolve("Tunnels live");
    });
  }
}
