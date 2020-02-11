const decompress = require('decompress');
const deleter = require('delete');
const fetch = require('node-fetch');
const fs = require('fs');
const fsPromises = fs.promises;

interface Version {
  version: string;
  updated: string;
}
const path = {
  latestDist: 'latest/dist',
  latestVersion: 'latest/version.json',
  tempDist: 'tmp/dist.zip',
  remoteVersion: 'http://storage.googleapis.com/fighter-html/version.json',
  remoteDist: (version: string) => `http://storage.googleapis.com/fighter-html/${version}.zip`,
};

const downloadDist = async (version: string) => {
  console.log('downloading:', version);
  await deleter.promise([path.tempDist]);
  const latestResp = await fetch(path.remoteDist(version));
  const stream = fs.createWriteStream(path.tempDist);
  await new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
    latestResp.body.pipe(stream);
  });
  console.log('finished download');
};

const unzipDist = async () => {
  console.log('unzipping...');
  await deleter.promise([path.latestDist]);
  await decompress(path.tempDist, path.latestDist);
  await deleter.promise([path.tempDist]);
}

const fetchVersion = async () => {
  const versionRep = await fetch(path.remoteVersion);
  const newVersionRaw = await versionRep.text();
  const newVersion: Version = JSON.parse(newVersionRaw);

  let oldVersion: (Version | undefined);
  try {
    const oldVersionRaw = await fsPromises.readFile(path.latestVersion);
    oldVersion = JSON.parse(oldVersionRaw);
  } catch (e) {
    // do nothing
  }

  console.log(oldVersion, newVersion);
  if (!oldVersion || oldVersion.version !== newVersion.version) {
    await downloadDist(newVersion.version);
    await unzipDist();
  } else {
    console.log('already up to date');
  }

  console.log('updating version.json');
  await fsPromises.writeFile(path.latestVersion, newVersionRaw);
  console.log('done!');
};
fetchVersion();

// ts-lint
export { };
