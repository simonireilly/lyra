import { readFileSync, writeFileSync } from "fs";
import { Lyra } from "../lyra";
import { TrieNode } from "../prefix-tree/node";
import { Trie } from "../prefix-tree/trie";
import { formatNanoseconds, getNanosecondsTime } from "../utils";

export const _persistIndex = (
  index: Map<string, Trie>,
  docs: Map<any, any>
) => {
  const stats = {
    docs: {
      length: docs.size,
      duration: "0",
      processed: 0,
    },
    tree: {
      duration: "0",
      processed: 0,
    },
    total: {
      duration: "0",
    },
  };

  function docsToJson(docs: Map<any, any>) {
    const iterator = docs.entries();
    let current = iterator.next().value;
    while (current) {
      documents[current[0]] = current[1];
      current = iterator.next().value;
      stats.docs.processed += 1;
    }
  }

  function recurseThroughTrieChidlren(
    current: TrieNode,
    flatNode: Record<string, any>
  ) {
    if (!current.children) return;

    const childrenIterator = current.children.entries();
    let currentNode = childrenIterator.next().value;

    while (currentNode) {
      const docsIterator = currentNode[1].docs.values();
      let currentDoc = docsIterator.next().value;
      flatNode[currentNode[0]] = {};

      while (currentDoc) {
        if (currentDoc) {
          (flatNode[currentNode[0]].docs ||= []).push(currentDoc);
        }
        currentDoc = docsIterator.next().value;
      }

      recurseThroughTrieChidlren(currentNode[1], flatNode[currentNode[0]]);
      currentNode = childrenIterator.next().value;
      stats.tree.processed += 1;
    }
  }

  const documents = {} as Record<string, {}>;
  const keys = {
    indexes: [] as string[],
    nodes: {} as Record<string, {}>,
  };

  const timeStart = getNanosecondsTime();
  let checkpoint = timeStart;

  docsToJson(docs);

  checkpoint = getNanosecondsTime();
  stats.docs.duration = formatNanoseconds(checkpoint - timeStart);

  const iterator = index.entries();
  let current = iterator.next().value;

  while (current) {
    keys.indexes.push(current[0]);
    keys.nodes[current[0]] = {};

    const rootNode = current[1].root;
    recurseThroughTrieChidlren(rootNode, keys.nodes[current[0]]);

    current = iterator.next().value;
    stats.tree.processed += 1;
  }

  stats.tree.duration = formatNanoseconds(checkpoint - timeStart);
  stats.total.duration = formatNanoseconds(getNanosecondsTime() - timeStart);

  writeFileSync("./tmp/docs", JSON.stringify(documents));
  writeFileSync("./tmp/tree", JSON.stringify(keys));
  writeFileSync("./tmp/stats", JSON.stringify(stats));
};

export const _restoreIndex = () => {
  const timeStart = getNanosecondsTime();
  let checkpoint = timeStart;

  const stats = {
    docs: {
      parse: {
        duration: "0",
      },
      insert: {
        duration: "0",
      },
      processed: 0,
    },
    tree: {
      duration: "0",
      processed: 0,
    },
    total: {
      duration: "0",
    },
  };

  const fileDocs = readFileSync("./tmp/docs");
  let parsedDocs;

  if (Buffer.isBuffer(fileDocs)) {
    parsedDocs = JSON.parse(fileDocs.toString());
  }
  checkpoint = getNanosecondsTime();
  stats.docs.parse.duration = formatNanoseconds(checkpoint - timeStart);

  const docMap = new Map();

  for (const doc of Object.entries(parsedDocs)) {
    docMap.set(doc[0], doc[1]);
  }

  stats.docs.insert.duration = formatNanoseconds(
    getNanosecondsTime() - checkpoint
  );
  stats.docs.processed = docMap.size;

  checkpoint = getNanosecondsTime();

  function restoreTreeFromJSON() {
    let parsedTree;

    if (Buffer.isBuffer(readFileSync("./tmp/docs"))) {
      parsedDocs = JSON.parse(fileDocs.toString());
    }
  }

  restoreTreeFromJSON();

  return {
    docMap,
  };
};
