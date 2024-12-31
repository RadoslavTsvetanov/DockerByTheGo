import { BuildFolderStructure, type FolderStructure } from "..";
import { Path } from "../index";

const ExpectedFolderStrcuture: FolderStructure = {
  metadata: {
    name: "example",
    pointsTo: [],
    pathToFile: new Path("./texts/example"),
  },
  files: [
    {
      metadata: {
        name: "huhu.rs",
        pointsTo: [],
        pathToFile: new Path("./tests/example/huhu.rs"),
      },
      content: "j",
    },
  ],
  directories: [
    {
      metadata: {
        name: "structure",
        pointsTo: [],
        pathToFile: new Path("./tests/example/structure"),
      },
      files: [
        {
          metadata: {
            name: "hui.rs",
            pointsTo: [],
            pathToFile: new Path("./tests/example/structure/hui.rs"),
          },
          content: "ojbu",
        },
      ],
      directories: [
        {
          metadata: {
            name: "reference",
            pointsTo: [],
            pathToFile: new Path("./tests/example/structure/reference"),
          },
          files: [
            {
              metadata: {
                name: "gucci.rs",
                pointsTo: [],
                pathToFile: new Path(
                  "./tests/example/structure/reference/gucci.rs",
                ),
              },
              content: "t",
            },
          ],
          directories: [],
        },
      ],
    },
  ],
};

const structure = await BuildFolderStructure("./tests/example");
console.dir(
  JSON.stringify(structure) === JSON.stringify(ExpectedFolderStrcuture),
)(
  "got",
  JSON.stringify(structure),
)("================================================")(
  "exp",
  JSON.stringify(ExpectedFolderStrcuture),
);
