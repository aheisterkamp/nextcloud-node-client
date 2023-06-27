import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    File,
    Folder,
} from "../client";
import Server from "../server";
import { getNextcloudClient } from "./testUtils";

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("05-NEXCLOUD-NODE-CLIENT-README", function () {
    this.timeout(1 * 60 * 1000);

    it.skip("01 readme", async () => {

        // service instance name from VCAP_SERVICES environment - "user-provided" section
        try {
            const server = new Server({ url: "http:/test.test", basicAuth: { username: "user", password: "password" } });
            const client = new Client(server);
            const folder: Folder = await client.createFolder("test");
            const file: File = await folder.createFile("myFile.txt", Buffer.from("My file content"));
            await file.addTag("MyTag");
            await file.addTag("myComment");
            await folder.delete();

            const content: Buffer = await file.getContent();
        } catch (e: any) {
            // some error handling
        }
    });

});
