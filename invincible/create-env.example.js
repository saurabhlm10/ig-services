const fs = require("fs");

const devPath = "./dev.env.json";
const prodPath = "./prod.env.json";

const envs = {
  dev: {
    ENV: "dev",
    MongoUri: "",
  },
  prod: {
    ENV: "prod",
    MongoUri: "",
  },
};

const functionEnvMapping = {
  CreateNicheFunction: ["ENV", "MongoUri"],
  GetNicheFunction: ["ENV", "MongoUri"],
  AddIGPageToNicheFunction: ["ENV", "MongoUri"],
  CreateNicheApifyDatasetStatusFunction: ["ENV", "MongoUri"],
  CreateRawPostsFunction: ["ENV", "MongoUri"],
  GetNicheRawPostsFunction: ["ENV", "MongoUri"],
  GetMonthNicheRawPostsFunction: ["ENV", "MongoUri"],
  GetMonthNicheRawPostsWithPagesAssignedFunction: ["ENV", "MongoUri"],
  AddPagesToRawPostsFunction: ["ENV", "MongoUri"],
  UpdateRawPostsDateAndTimeFunction: ["ENV", "MongoUri"],
  CreateCollectionIGPageFunction: ["ENV", "MongoUri"],
  GetCollectionIGPageUsingNameFunction: ["ENV", "MongoUri"],
  AddCompletedCollectionPageToNicheApifyDatasetStatusFunction: [
    "ENV",
    "MongoUri",
  ],
  CheckNichePostCollectionFunction: ["ENV", "MongoUri"],
  GetNichePagesFunction: ["ENV", "MongoUri"],
  CreateStageFunction: ["ENV", "MongoUri"],
  GetAllStagesFunction: ["ENV", "MongoUri"],
  GetAllPagesFunction: ["ENV", "MongoUri"],
};

const createEnvFile = (env, path) => {
  const envVars = {};

  Object.keys(functionEnvMapping).forEach((functionName) => {
    envVars[functionName] = {};
    functionEnvMapping[functionName].forEach((envVar) => {
      envVars[functionName][envVar] = env[envVar];
    });
  });

  fs.writeFileSync(path, JSON.stringify(envVars, null, 2));
};

createEnvFile(envs.dev, devPath);
createEnvFile(envs.prod, prodPath);

console.log("Environment files created successfully.");
