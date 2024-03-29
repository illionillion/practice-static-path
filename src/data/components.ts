import { readFileSync, readdirSync } from "fs";
import path from "path";

export interface ComponentInfo {
  component: string;
  slug: string;
  code: string;
  // code: { fileName: string; language: string; code: string }[];
  attributes: any;
}

const convertCase = (string: string) => {
  const splitted = string
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ");
  return splitted.join("-");
};

const getComponentCode = (componentFolder: string, componentName: string) => {
  const componentContents = readdirSync(componentFolder).filter(
    (item) =>
      (item.endsWith(".tsx") && !item.endsWith(".story.tsx")) ||
      item.endsWith(".ts") ||
      item.endsWith(".css")
  );

  const mainFileContent = readFileSync(
    path.join(componentFolder, `${componentName}.tsx`),
    "utf-8"
  );
  const otherFilesContent = componentContents
    .filter((file) => file !== `${componentName}.tsx`)
    .map((file) => ({
      name: file,
      content: readFileSync(path.join(componentFolder, file), "utf-8"),
    }));

  return [
    {
      fileName: `${componentName}.tsx`,
      language: "tsx",
      code: mainFileContent,
    },
    ...otherFilesContent.map(({ name, content }) => ({
      fileName: name,
      language: name.endsWith(".css") ? "scss" : "tsx",
      code: content,
    })),
  ];
};

export const getAllComponents = async (): Promise<ComponentInfo[]> => {
  const rootFolder = path.join(process.cwd(), "src", "contents");
  const paths = readdirSync(rootFolder);

  // 全ての非同期処理を待つためのPromise配列
  const promises = paths.map(async (componentName: string) => {
    // metadataを非同期で取得する
    const { metadata } = await import(
      "../contents/" + componentName + "/index"
    );

    // ローカル上のファイルパス取得
    const filePath = path.join(rootFolder, componentName, 'index.tsx');

    // ファイルの読み込み
    const fileContent = readFileSync(filePath, 'utf8');
    const index = fileContent.split('\n').findIndex((v) => /export\s+const\s+metadata\s*=\s*{/.test(v));
    const code = fileContent.split('\n').slice(0, index).filter(line => !line.includes('export')).join('\n')

    return {
      component: componentName,
      slug: convertCase(componentName),
      attributes: metadata,
      code: code
    };
  });

  // Promise配列の完了を待ち、結果を返す
  const results = await Promise.all(promises);

  // nullでない要素だけを抽出して返す
  return results.filter((c) => c);
};

export const getComponentsByCategory = async () => {
  return (await getAllComponents()).reduce<Record<string, ComponentInfo[]>>(
    (acc, component) => {
      if (!(component.attributes.category in acc)) {
        acc[component.attributes.category] = [];
      }
      acc[component.attributes.category].push(component);
      return acc;
    },
    {}
  );
};
