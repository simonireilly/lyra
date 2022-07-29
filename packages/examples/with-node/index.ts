import { Lyra } from "@nearform/lyra";
import seeds from "./fixtures/sample.json";

const newIndex = () => {
  return new Lyra({
    schema: {
      id: "string",
      txt: "string",
    },
  });
};

export const seed = async (
  db: Lyra,
  document: Array<Record<string, string>>
) => {
  for (const doc of document) {
    await db.insert(doc);
  }
};

const main = async () => {
  const master = newIndex();
  const rebuild = newIndex();

  const searchTerms = {
    term: "if",
    tolerance: 1,
  };

  console.time("seed");
  await seed(master, seeds);
  console.timeEnd("seed");

  console.time("persist");
  master.persistIndex();
  console.timeEnd("persist");

  const o = await master.search(searchTerms);

  console.time("restore");
  rebuild.restoreIndex();
  console.timeEnd("restore");

  const c = await rebuild.search(searchTerms);

  console.info({
    o,
    c,
  });
};

main();
