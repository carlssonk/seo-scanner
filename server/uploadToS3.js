import archiver from "archiver";
import fs from "fs";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

const init = async () => {
  // Remove previouse zip file
  await executeCommand("rm -f server.zip");
  // Create new zip file
  await zipDirectory("dist", "server.zip");
  // Update s3 bucket
  await executeCommand("aws s3 cp server.zip s3://scanner.server");
  // Update lambda function
  await executeCommand(
    "aws lambda update-function-code --function-name webScanner --s3-bucket scanner.server --s3-key server.zip --region eu-north-1"
  );
  console.log("DONE");
};

const zipDirectory = async (sourceDir, outPath) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const executeCommand = async (command) => {
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
};

init();
