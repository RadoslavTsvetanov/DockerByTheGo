import { randomUUID } from "crypto";
import fs from "fs/promises";
import { readFile } from "fs/promises";
import path from "path";
import type { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES } from "react";
import { loadConfig } from "./config/index.ts";

export class Node {
  name: string;
  children: Node[] = [];
  private metaData: { path: Path };

  constructor(name: string, path: Path) {
    this.name = name;
    this.metaData = {
      path: path,
    };
  }

  addChild(child: Node) {
    this.children.push(child);
    return this;
  }
}

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

type Metadata = {
  pointsTo: PathConcreteType[];
  name: string;
  pathToFile: Path;
};

type Note = {
  content: string;
  metadata: Metadata;
};

async function listFiles(dir: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];

  try {
    const dirEntries = await fs.readdir(dir, { withFileTypes: true }); // Read with file type info
    dir;
    for (const entry of dirEntries) {
      entries.push({
        name: entry.name,
        isDirectory: entry.isDirectory(),
      });
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }

  return entries;
}

const graphCache: Record<PathConcreteType, Node> = {};

class ContextSafeConcreteType<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }

  getV(): T {
    return this.value;
  }
}

type PathConcreteType = string;

export class Path extends ContextSafeConcreteType<string> {
  constructor(value: PathConcreteType) {
    if (value.indexOf(".") < 0) {
      return // see this again later
    }
    super(value);
  }
}

function findNodeByPath(folderPath: Path): Node {
  // TODO: make it so that if it does not find anythiong in the cache it should also go through the whole current graph
  return graphCache[folderPath.getV()];
}

async function getNoteData(fileContent: string): Promise<Note | null> {
  try {
    const parsedContent = JSON.parse(fileContent) as Note;
    return parsedContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error(`Error parsing JSON from file: ${e.message}`);
    return null;
  }
}

export type FolderStructure = {
  metadata: Metadata;
  files: Note[];
  directories: FolderStructure[];
};

export async function BuildFolderStructure(pathName: string) {
  const config = loadConfig();

  const folderStructure: FolderStructure = {
    metadata: {
      pointsTo: [],
      name: pathName.slice(pathName.lastIndexOf("/") + 1, pathName.length),
      pathToFile: new Path(pathName),
    },
    files: [],
    directories: [],
  };

  const entries = await listFiles(pathName);
  for (const entry of entries) {
    const fullPath = "./" + path.join(pathName, entry.name);

    if (entry.isDirectory) {
      if (
        config.excludedFolders.some(
          (excludedFolder) => entry.name.indexOf(excludedFolder) > -1,
        )
      ) {
        continue;
      }
      folderStructure.directories.push(await BuildFolderStructure(fullPath));
    } else {
      if (
        config.excludedFiles.some(
          (excludedFile) => entry.name.indexOf(excludedFile) > -1,
        )
      ) {
        continue;
      }

      const fileContent = await readFile(fullPath);
      const noteDataExtractedFromRqwFile = await getNoteData(
        fileContent.toString(),
      );

      if (noteDataExtractedFromRqwFile !== null) {
        // TODO: inverse it using guard clause
        if (entry.name === "folder_metadata.note") {
          folderStructure.metadata.pointsTo.push(
            noteDataExtractedFromRqwFile?.metadata.pathToFile?.getV(),
          );
          continue;
        }

        folderStructure.files.push(noteDataExtractedFromRqwFile);
      } else {
        folderStructure.files.push({
          metadata: {
            name: entry.name,
            pointsTo: [],
            pathToFile: new Path(fullPath),
          },
          content: fileContent.toString(),
        });
      }
    }
  }

  return folderStructure;
}

/*
! why is this in a seperate function

First its easier to test 

Second: imagine we a re traversing a right heavy folder structure, this algorithm is biased to go fro left to right, so if it a file points to a folder which is oin the right we still wouldnt have populted it and so it woulnt know ehrre this folder is, when we pass a folderStructure hiwever its populated aready

Third: If a file referncees a folder in a deeper folder than the lvl of the file the algo might have not gone through it,like this with aa FolderStructure however we know the whoiooe structure at every time

!Note: path to file can be used as a unique id since there cabnt be two files with the same path

*/

function isSomething(v: unknown) {
  return v !== undefined && v !== null;
}

function createNewNode(data: { name: string; pathName: Path }) {
  const existingNode = graphCache[data.pathName.getV()];

  if (isSomething(existingNode)) {
    return existingNode;
  } else {
    const newNode = new Node(data.name, data.pathName);
    graphCache[data.pathName.getV()] = newNode;
    return newNode;
  }
  return isSomething(existingNode)
    ? existingNode
    : new Node(data.name, data.pathName);
}

export async function buildGraph(folder: FolderStructure): Promise<Node> {
  const newNode = createNewNode({
    name: folder.metadata.name,
    pathName: folder.metadata.pathToFile,
  });
  graphCache[folder.metadata.pathToFile.getV()] = newNode;

  for (const parent of folder.metadata.pointsTo) {
    let parentNode = findNodeByPath(new Path(parent));
    if (!parentNode) {
      parentNode = createNewNode({
        name: parent,
        pathName: new Path(parent),
      });
      graphCache[parent] = parentNode; // cache it if it's a new folder not yet visited
    }
    parentNode.addChild(newNode);
  }

  for (const child of folder.files) {
    const childNode = createNewNode({
      name: child.metadata.name,
      pathName: child.metadata.pathToFile,
    });
    newNode.addChild(childNode);

    for (const parent of child.metadata.pointsTo) {
      let parentNode = findNodeByPath(new Path(parent));
      if (!parentNode) {
        parentNode = createNewNode({
          name: parent,
          pathName: new Path(parent),
        });
        graphCache[parent] = parentNode; // cache it, since it might be a new folder
      }
      parentNode.addChild(childNode);
    }
  }

  for (const dir of folder.directories) {
    const dirNode = createNewNode({
      name: dir.metadata.name,
      pathName: dir.metadata.pathToFile,
    });
    newNode.addChild(dirNode);
    await buildGraph(dir); // Recursive call to handle subdirectories
  }

  return newNode;
}
