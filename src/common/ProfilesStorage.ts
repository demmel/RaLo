import * as pathUtils from "path";
import fs from "fs";
import electron from "electron";

const app = electron.app || electron.remote.app;

type StorageStorage = {
  type: "localDirectory";
  path: string;
};

type ProfileStorage = {
  name: string;
  storage: StorageStorage;
};

type ProfilesStorage = {
  selected: number;
  profiles: Array<ProfileStorage>;
};

type LoadFileResult =
  | { type: "ok"; contents: string }
  | { type: "does_not_exist" }
  | { type: "unknown"; err: Error };

async function loadFile(path: string): Promise<LoadFileResult> {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
  } catch (err) {
    // File does not exist, so no profile to return;
    return { type: "does_not_exist" };
  }
  let contents;
  try {
    contents = await fs.promises.readFile(path, {
      encoding: "utf-8",
    });
  } catch (err) {
    return { type: "unknown", err };
  }
  return { type: "ok", contents };
}

type SaveFileResult = { type: "ok" } | { type: "unknown"; err: Error };

async function saveFile(
  path: string,
  contents: string
): Promise<SaveFileResult> {
  try {
    await fs.promises.writeFile(path, contents);
  } catch (err) {
    return { type: "unknown", err };
  }
  return { type: "ok" };
}

function isProfilesStorage(json: any): json is ProfilesStorage {
  return "selected" in json && "profiles" in json;
}

function profileFilesPath(): string {
  const userDataPath = app.getPath("userData");
  const profilesFile = pathUtils.join(userDataPath, "profiles.json");
  return profilesFile;
}

export async function loadProfiles(): Promise<ProfilesStorage | null> {
  const profilesFile = profileFilesPath();
  console.log("Loading profiles from: ", profilesFile);
  const res = await loadFile(profilesFile);
  let profilesRaw;
  switch (res.type) {
    case "ok":
      profilesRaw = res.contents;
      break;
    case "does_not_exist":
      return null;
    case "unknown":
      throw res.err;
  }
  const profilesJSON = JSON.parse(profilesRaw);
  if (!isProfilesStorage(profilesJSON)) {
    throw new Error("Malformed profiles file");
  }
  return profilesJSON;
}

export async function saveProfiles(profiles: ProfilesStorage): Promise<void> {
  const profilesFile = profileFilesPath();
  const res = await saveFile(profilesFile, JSON.stringify(profiles));
  switch (res.type) {
    case "ok":
      return;
    case "unknown":
      throw res.err;
  }
}
