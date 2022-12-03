"use strict";

/*
Практическое задание
Примените полученные знания к программе, которую вы написали на прошлом уроке.
Для этого превратите её в консольное приложение, по аналогии с разобранным примером, и добавьте следующие функции:
1. Возможность передавать путь к директории в программу. Это актуально, когда вы не хотите покидать текущую директорию, но надо просмотреть файл, находящийся в другом месте.
2. В директории переходить во вложенные каталоги.
3. Во время чтения файлов искать в них заданную строку или паттерн.
*/

import {
  lstatSync,
  existsSync,
  truncate,
  createReadStream,
  writeFile,
} from "fs";
import { createInterface } from "readline";
import pkgColors from "colors";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import inquirer from "inquirer";
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt";

inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);

const { grey, blue, bold, underline } = pkgColors;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reIp1 = /89.123.1.41/;
const reIp2 = /34.48.240.111/;

const isFile = (fileName) => {
  return lstatSync(fileName).isFile();
};

const writeFiles = (line) => {
  if (line.match(reIp1)) {
    writeFile(
      "./%89.123.1.41%_requests.log",
      line + "\n",
      { flag: "a" },
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  } else if (line.match(reIp2)) {
    writeFile(
      "./%34.48.240.111%_requests.log",
      line + "\n",
      { flag: "a" },
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  }
};

const question = [
  {
    type: "file-tree-selection",
    name: "file",
    default: __dirname,
    message: "choose a file",
    transformer: (item) => {
      const name = item.split(path.sep).pop();
      if (name[0] === ".") return grey(name);
      if (!isFile(item)) return underline(bold(name));
      return name;
    },
    validate: (item) => {
      if (!isFile(item)) return false;
      return true;
    },
  },
];

const main = () => {
  if (existsSync("./%89.123.1.41%_requests.log")) {
    truncate("./%89.123.1.41%_requests.log", (err) => {
      if (err) throw err;
    });
  }

  if (existsSync("./%34.48.240.111%_requests.log")) {
    truncate("./%34.48.240.111%_requests.log", (err) => {
      if (err) throw err;
    });
  }

  inquirer.prompt(question).then((answer) => {
    console.log("answer", answer.file);
    const filePath = answer.file;
    const readStream = createReadStream(filePath, "utf-8");
    const rl = createInterface({ input: readStream });
    rl.on("line", (line) => {
      writeFiles(line);
    });

    rl.on("error", (error) => console.log(error.message));
    rl.on("close", () => {
      console.log(blue("Operation completed successfully"));
    });
  });
};

main();
