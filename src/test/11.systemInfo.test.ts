
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    ISystemInfo,
    ISysBasicData,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient } from "./testUtils";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("11-NEXCLOUD-NODE-CLIENT-SYSTEM-INFO", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 get system info", async () => {

        let sysInfo: ISystemInfo;
        try {
            sysInfo = await client.getSystemInfo();
            expect(sysInfo).to.have.property("nextcloud");
            expect(sysInfo.nextcloud).to.have.property("system");
            expect(sysInfo.nextcloud.system).to.be.a("object");
            expect(sysInfo.nextcloud).to.have.property("storage");
            expect(sysInfo.nextcloud.storage).to.be.a("object");
            expect(sysInfo.nextcloud).to.have.property("shares");
            expect(sysInfo.nextcloud.shares).to.be.a("object");
            expect(sysInfo).to.have.property("server");
            expect(sysInfo.server).to.be.a("object");
            expect(sysInfo).to.have.property("activeUsers");
            expect(sysInfo.activeUsers).to.be.a("object");
            expect(sysInfo).to.have.property("nextcloudClient");
            expect(sysInfo.nextcloudClient).to.have.property("version");
            expect(sysInfo.nextcloudClient.version).to.be.a("string");

        } catch (e: any) {
            expect(e, "expect no exception").to.be.equal(null);
        }

    });

    it("02 get system info fails", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"NOTFOUNDocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("03 get system info fails - nextcloud-system missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"NOTFOUND-system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("04 get system info fails - nextcloud-storage missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"NOTFOUND-storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("05 get system info fails - nextcloud-shares missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"NOTFOUND-shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("06 get system info fails - nextcloud-data-server missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"NOTFOUND-server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("07 get system info fails - data-activeUsers missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"NOTFOUND-activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("08 get system info fails - data-nextcloud missing", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"NOTFOUND-nextcloud\":{\"system\":{\"version\":\"18.0.0.10\",\"theme\":\"\",\"enable_avatars\":\"yes\",\"enable_previews\":\"yes\",\"memcache.local\":\"\\\\OC\\\\Memcache\\\\APCu\",\"memcache.distributed\":\"none\",\"filelocking.enabled\":\"yes\",\"memcache.locking\":\"\\\\OC\\\\Memcache\\\\Redis\",\"debug\":\"no\",\"freespace\":248184516608,\"cpuload\":[0.42,0.16,0.1],\"mem_total\":4039484,\"mem_free\":2845664,\"swap_total\":2097148,\"swap_free\":2072428,\"apps\":{\"num_installed\":48,\"num_updates_available\":0,\"app_updates\":[]}},\"storage\":{\"num_users\":2,\"num_files\":103909,\"num_storages\":4,\"num_storages_local\":2,\"num_storages_home\":2,\"num_storages_other\":0},\"shares\":{\"num_shares\":2,\"num_shares_user\":0,\"num_shares_groups\":0,\"num_shares_link\":2,\"num_shares_mail\":0,\"num_shares_room\":0,\"num_shares_link_no_password\":2,\"num_fed_shares_sent\":0,\"num_fed_shares_received\":0,\"permissions_3_1\":\"2\"}},\"server\":{\"webserver\":\"nginx\\/1.14.0\",\"php\":{\"version\":\"7.2.24\",\"memory_limit\":536870912,\"max_execution_time\":3600,\"upload_max_filesize\":2097152},\"database\":{\"type\":\"mysql\",\"version\":\"10.1.43\",\"size\":92266496}},\"activeUsers\":{\"last5minutes\":1,\"last1hour\":1,\"last24hours\":2}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemInfo();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("10 get system basic data", async () => {

        let sysInfo: ISysBasicData;
        try {
            sysInfo = await client.getSystemBasicData();

            expect(sysInfo).to.have.property("serverTimeString");
            expect(sysInfo.serverTimeString).to.be.a("string");
            expect(sysInfo).to.have.property("uptimeString");
            expect(sysInfo.uptimeString).to.be.a("string");
            expect(sysInfo).to.have.property("timeServersString");
            expect(sysInfo.timeServersString).to.be.a("string");
        } catch (e: any) {
            expect(e, "expect no exception").to.be.equal(null);
        }

    });

    it("11 get system basic data fails - servertime", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"NOTFOUND-servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemBasicData();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("12 get system basic data fails - uptime", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"NOTFOUND-uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemBasicData();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

    it("13 get system basic data fails - timeservers", async () => {

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "SystemInfo get",
                method: "GET",
                url: "/ocs/v2.php/apps/serverinfo/api/v1/basicdata",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":200,\"message\":\"OK\"},\"data\":{\"servertime\":\"Tue Apr 14 12:45:28 CEST 2020\\n\",\"uptime\":\"up 9 weeks, 5 days, 23 hours, 41 minutes\\n\",\"NOTFOUND-timeservers\":\" \"}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let errorCode = "";
        try {
            await lclient.getSystemBasicData();
        } catch (e: any) {
            errorCode = e.code || e.message;
        }
        expect(errorCode, "expect an exception with the code").to.be.equal("ERR_SYSTEM_INFO_MISSING_DATA");
    });

});
