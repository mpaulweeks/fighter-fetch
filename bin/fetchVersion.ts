const fs = require('fs').promises;
const fetch = require('node-fetch');

interface Version {
  version: string;
  updated: string;
}

const fetchVersion = async () => {
  const versionRep = await fetch('http://storage.googleapis.com/fighter-html/version.json');
  const newVersionRaw = await versionRep.text();
  const newVersion: Version = JSON.parse(newVersionRaw);

  let oldVersion: (Version | undefined);
  try {
    const oldVersionRaw = await fs.readFile('latest/version.json');
    oldVersion = JSON.parse(oldVersionRaw);
  } catch (e) {
    // do nothing
  }

  console.log(oldVersion, newVersion);
  if (!oldVersion || oldVersion.version !== newVersion.version) {
    console.log('downloading:', newVersion.version);
    const latestUrl = `http://storage.googleapis.com/fighter-html/${newVersion.version}.zip`;
    const latestResp = await fetch(latestUrl);
    const latestRaw = await latestResp.blob();
    await fs.writeFile('tmp/game.zip', latestRaw);
  } else {
    console.log('already up to date');
  }

  await fs.writeFile('latest/version.json', newVersionRaw);
};
fetchVersion();

// ts-lint
export { };
