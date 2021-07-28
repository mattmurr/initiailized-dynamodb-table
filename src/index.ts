import * as fs from "fs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as cr from "@aws-cdk/custom-resources";
import * as util from "@aws-sdk/util-dynamodb";

// Blob and File need to exist to compile without having DOM.
declare global {
  interface Blob {}
  interface File {}
}

export interface InitializedDynamodbTableProps {
  readonly dataPath: string;
  readonly tableProps: dynamodb.TableProps;
  readonly timeout?: cdk.Duration;
}

export class InitializedDynamodbTable extends dynamodb.Table {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: InitializedDynamodbTableProps
  ) {
    super(scope, id, props.tableProps);

    fs.readFile(props.dataPath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      const json = JSON.parse(data);

      // 25 is max number fo requests in DynamoDB batchWriteItem
      const step = 25;

      for (let i = 0; i < json.length; i += step) {
        const slice = json.slice(i, i + step);
        this.insertRecords(
          this.tableName,
          this.tableArn,
          slice,
          `Batch${Math.floor(i / step) + 1}`,
          props.timeout
        );
      }
    });
  }

  private insertRecords = (
    tableName: string,
    tableArn: string,
    items: any[],
    key: string,
    timeout?: cdk.Duration
  ) => {
    let batchRequests: any[] = [];
    items.forEach((item) => {
      batchRequests.push({
        PutRequest: {
          Item: util.marshall(item),
        },
      });
    });

    const batch = { RequestItems: { [tableName]: batchRequests } };

    const awsSdkCall: cr.AwsSdkCall = {
      service: "DynamoDB",
      action: "batchWriteItem",
      physicalResourceId: cr.PhysicalResourceId.of(tableName + "Insert"),
      parameters: batch,
    };

    new cr.AwsCustomResource(this, "InitializeTable" + key, {
      onCreate: awsSdkCall,
      onUpdate: awsSdkCall,
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [tableArn],
      }),
      timeout: timeout,
    });
  };
}
