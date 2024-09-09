const fs = require("fs");

const devPath = "./dev.env.json";
const prodPath = "./prod.env.json";

const envs = {
  dev: {
    MongoUri: "",
  },
  prod: {
    MongoUri: "",
  },
};

const functionEnvMapping = {
  CreateNicheFunction: ["MongoUri"],
  GetNicheFunction: ["MongoUri"],
  AddIGPageToNicheFunction: ["MongoUri"],
  CreateNicheApifyDatasetStatusFunction: ["MongoUri"],
  CreateRawPostsFunction: ["MongoUri"],
  GetNicheRawPostsFunction: ["MongoUri"],
  GetMonthNicheRawPostsFunction: ["MongoUri"],
  GetMonthNicheRawPostsWithPagesAssignedFunction: ["MongoUri"],
  AddPagesToRawPostsFunction: ["MongoUri"],
  UpdateRawPostsDateAndTimeFunction: ["MongoUri"],
  CreateCollectionIGPageFunction: ["MongoUri"],
  GetCollectionIGPageUsingNameFunction: ["MongoUri"],
  AddCompletedCollectionPageToNicheApifyDatasetStatusFunction: ["MongoUri"],
  CheckNichePostCollectionFunction: ["MongoUri"],
  GetNichePagesFunction: ["MongoUri"],
  CreateStageFunction: ["MongoUri"],
  GetAllStagesFunction: ["MongoUri"],
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
