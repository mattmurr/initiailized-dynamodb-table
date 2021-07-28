import "@aws-cdk/assert/jest";
import { join } from "path";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import { InitializedDynamodbTable } from "../src/index";

test("Table Created", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new InitializedDynamodbTable(stack, "TestTable", {
    dataPath: join(__dirname, "sample.json"),
    tableProps: {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    },
  });

  expect(stack).toHaveResourceLike("AWS::DynamoDB::Table");
});
