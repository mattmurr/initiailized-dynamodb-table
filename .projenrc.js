const { AwsCdkConstructLibrary } = require("projen");

const project = new AwsCdkConstructLibrary({
  author: "Matthew Murray",
  authorAddress: "mattmurr.uk@gmail.com",
  cdkVersion: "1.95.2",
  defaultReleaseBranch: "main",
  name: "initialized-dynamodb-table",
  description: "Initialize DynamoDB tables from a local JSON file",
  repositoryUrl: "https://github.com/mattmurr/initialized-dynamodb-table.git",
  license: "MIT",

  npmignore: [".envrc", ".nvmrc"],
  npmAccess: "public",

  cdkDependencies: [
    "@aws-cdk/core",
    "@aws-cdk/custom-resources",
    "@aws-cdk/aws-dynamodb",
  ],
  bundledDeps: ["@aws-sdk/util-dynamodb", "@aws-sdk/client-dynamodb"],
  cdkTestDependencies: ["@aws-cdk/assert"],

  eslintOptions: {
    prettier: true,
  },
});

project.synth();
