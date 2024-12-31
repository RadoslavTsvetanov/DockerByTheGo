import { buildGraph, Node, Path, type FolderStructure } from "../index";
import * as _ from "lodash";

const expected = new Node("hui", new Path("./test/hui"));
const test2Node = new Node("test2", new Path("./test/hui/test2"));
const test3Node = new Node("test3", new Path("./test/hui/test3"));
const sharedNode = new Node(
  "chichi_child_of_chichi",
  new Path("./test/hui/chichi/chichi_child_of_chichi"),
);

expected.addChild(test2Node);
test3Node.addChild(sharedNode);
expected.addChild(test3Node);
expected.addChild(sharedNode);

const folderStructure: FolderStructure = {
  metadata: {
    name: "hui",
    pointsTo: [],
    pathToFile: new Path("./test/hui"),
  },
  files: [
    {
      metadata: {
        name: "test2",
        pointsTo: [],
        pathToFile: new Path("./test/hui/test2"),
      },
      content: "",
    },
  ],
  directories: [
    {
      metadata: {
        name: "test3",
        pointsTo: [],
        pathToFile: new Path("./test/hui/test3"),
      },
      files: [
        {
          metadata: {
            name: "chichi_child_of_chichi",
            pointsTo: ["./test/hui"],
            pathToFile: new Path("./test/hui/chichi/chichi_child_of_chichi"),
          },
          content: "",
        },
      ],
      directories: [],
    },
  ],
};

function formatJSON(obj: object): string {
  return JSON.stringify(obj, null, 2);
}

function displayComparison(obj1: object, obj2: object): void {
  const str1 = formatJSON(obj1).split("\n");
  const str2 = formatJSON(obj2).split("\n");
  const maxLength = Math.max(...str1.map((line) => line.length)) + 5;

  str1.forEach((line, i) => {
    line.padEnd(maxLength) + "|" + (str2[i] || "");
  });
}

(async () => {
  const got = await buildGraph(folderStructure);

  if (!_.isEqual(got, expected)) {
    ("Graph mismatch detected:");
    ("Generated vs. Expected (Side-by-Side):");
    displayComparison(got, expected);
  } else {
    ("Graphs match successfully.");
  }
})();

JSON.parse(JSON.stringify(await buildGraph(folderStructure.directories[0])));
