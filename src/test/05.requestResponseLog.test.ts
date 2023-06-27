import { expect } from "chai";
import { promises as fsPromises } from "fs";
import "mocha";
import RequestResponseLog from "../requestResponseLog";
import RequestResponseLogEntry, { RequestLogEntry, ResponseLogEntry } from "../requestResponseLogEntry";

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("05-NEXCLOUD-NODE-CLIENT-REQUEST-RESPONSE-LOG", function () {
    this.timeout(1 * 60 * 1000);
    const baseDirName: string = "tmp/testresults/";
    const testContextName: string = "requestResponseLogTest/d1/d2";
    afterEach(async () => {
        try {
            await fsPromises.rmdir(baseDirName, { recursive: true });
            // tslint:disable-next-line:no-empty
        } catch (e: any) { }
    });

    it("01 get request response log instance", async () => {
        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        expect(rrLog, "expect request response log to a object").to.be.a("object").that.is.instanceOf(RequestResponseLog);
        // get the recorder a second time
        const rrLog2: RequestResponseLog = RequestResponseLog.getInstance();
        expect(rrLog2, "expect request response log to a object").to.be.a("object").that.is.instanceOf(RequestResponseLog);
        RequestResponseLog.deleteInstance();
    });

    it("02 set request response log context", async () => {
        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        RequestResponseLog.deleteInstance();
    });

    it("03 request response logging", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
                "<?xml version=\"1.0\"?><body>This is a xml request body</body>",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                "<?xml version=\"1.0\"?><body>This is a xml response body</body>",
                "application/xml; charset=utf-8",
                "location header");

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();

        expect(rrLogEntries).to.be.an("Array");
        expect(rrLogEntries.length).to.be.equal(2);

        RequestResponseLog.deleteInstance();

    });

    it("04 request response logging without context", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
                "test request body",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                "some response text",
                "content type",
                "location header");

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
            expect(true, "expect an exception when adding an entry without context").to.be.equal(false);
        } catch (e: any) {
            expect(e.message, "expect exception").to.be.equal("Error while recording, context not set");
        }

        try {
            const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();
            expect(true, "expect an exception when getting the entries without context").to.be.equal(false);
        } catch (e: any) {
            expect(e.message, "expect exception").to.be.equal("Error while getting recording request, context not set");
        }

        RequestResponseLog.deleteInstance();

    });
    it("05 invalid xml body", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
                "<?xml version=\"1.0\"?><XXXXbody>This is invalid xml request body",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                "<?xml version=\"1.0\"?><body>This is a xml response body</body>",
                "application/xml; charset=utf-8",
                "location header");

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();

        expect(rrLogEntries).to.be.an("Array");
        expect(rrLogEntries.length).to.be.equal(2);

        RequestResponseLog.deleteInstance();

    });
    it("06 no body in request and response", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                undefined,
                "application/xml; charset=utf-8",
                "location header");

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();

        expect(rrLogEntries).to.be.an("Array");
        expect(rrLogEntries.length).to.be.equal(2);

        RequestResponseLog.deleteInstance();

    });
    it("07 response content type not xml", async () => {

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
                "text request body",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                "plain text body response",
                "text/plain",
                "location header");

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();

        expect(rrLogEntries).to.be.an("Array");
        expect(rrLogEntries.length).to.be.equal(2);

        RequestResponseLog.deleteInstance();

    });

    it("08 response content type json", async () => {

        // add a json response to the json body

        const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
        rrLog.baseDirectory = baseDirName;

        const requestLogEntry: RequestLogEntry =
            new RequestLogEntry(
                "https://my.url.com",
                "method",
                "This is a description",
                "text request body",
            );

        const responseLogEntry: ResponseLogEntry =
            new ResponseLogEntry(
                200,
                "{\"jsonProperty\":42}",
                "application/json",
                "location header");

        try {
            await rrLog.setContext(testContextName);
            expect(true, "expect no exception").to.be.equal(true);
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("no exception");
        }

        try {
            await rrLog.addEntry(new RequestResponseLogEntry(requestLogEntry, responseLogEntry));
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal("expect no exception");
        }

        const rrLogEntries: RequestResponseLogEntry[] = await rrLog.getEntries();

        expect(rrLogEntries).to.be.an("Array");
        expect(rrLogEntries.length).to.be.equal(1);

        expect(rrLogEntries[0]).to.have.property("response");
        expect(rrLogEntries[0].response).to.have.property("jsonBody");
        // console.log(rrLogEntries[0].response.jsonBody);
        expect(rrLogEntries[0].response.jsonBody).to.be.an("object");
        expect(rrLogEntries[0].response.jsonBody).to.have.property("jsonProperty");
        expect(rrLogEntries[0].response.jsonBody.jsonProperty).to.be.equal(42);

        RequestResponseLog.deleteInstance();

    });
});
