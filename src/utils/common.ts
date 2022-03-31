import axios from "axios";
import { resolve } from "dns";
import * as fs from 'fs';
import cli from 'cli-ux';

export const downloadFile = (url, path, bar): Promise<string> =>{
    return new Promise((resolve, reject) => {axios
    .get(url, { responseType: 'stream' })
    .then(({ data, headers }) => {
        data.pipe(fs.createWriteStream(path));
        let chunksCompleted = 0;

        data.on('data', chunk => {
            chunksCompleted += chunk.length;
            const percentage = Math.floor(
                (chunksCompleted /
                    parseInt(headers['content-length'])) *
                    100
            );
            bar.update(percentage);

            if (percentage === 100) {
                bar.stop();
                resolve(path);
            }
        });
    })
    .catch(err => {
        reject(err);
    });
  })
}