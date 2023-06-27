
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";
import {
    Client,
    QueryLimitError,
    QueryOffsetError,
    UserGroup,
    UserGroupAlreadyExistsError,
    UserGroupDeletionFailedError,
    UserGroupDoesNotExistError,
    IUserOptionsQuota,
    IUserQuotaUserFriendly,
    User,
    UserProperty,
    UserNotFoundError,
    UserCreateError,
    UserAlreadyExistsError,
    UserResendWelcomeEmailError,
    UserUpdateError,
    IUpsertUserOptions,
    InsufficientPrivilegesError,
    InvalidServiceResponseFormatError,
    OperationFailedError,
    IUpsertUserReport,
    Server,
    IServerOptions,
} from "../client";
import FakeServer from "../fakeServer";
import RequestResponseLogEntry from "../requestResponseLogEntry";
import { getNextcloudClient, recordingModeActive } from "./testUtils";

import Environment from "../environment";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("12-NEXCLOUD-NODE-CLIENT-USER-MANAGEMENT", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 1000);

    it("01 delete non existing user", async () => {
        const userId: string = "testUser01";
        let error: Error | null = null;
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("02 get non existing user", async () => {
        const userId: string = "testUser02";
        let error: Error | null = null;
        let user: User | null = null;
        try {
            user = await client.getUser(userId);
        } catch (e: any) {
            error = e;
        }

        expect(error).to.be.equal(null);
        expect(user).to.be.equal(null);
    });

    it("03 enable non existing user", async () => {
        const userId: string = "testUser03";
        let error: Error | null = null;
        try {
            await client.enableUser(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("04 disable non existing user", async () => {
        const userId: string = "testUser04";
        let error: Error | null = null;
        try {
            await client.disableUser(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("05 get user data of non existing user", async () => {
        const userId: string = "testUser05";
        let error: Error | null = null;
        try {
            await client.getUserData(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("06 create user with errors should fail", async () => {
        const userId: string = "testUser06";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        try {
            user = await client.createUser({ id: userId, password: "123456" });
        } catch (e: any) {
            error = e;
        }
        // password is under the most common ones
        expect(error).to.be.instanceOf(UserCreateError);

        try {
            user = await client.createUser({ id: userId });
        } catch (e: any) {
            error = e;
        }
        // email address is missing
        expect(error).to.be.instanceOf(UserCreateError);

        try {
            user = await client.createUser({ id: userId, email: "This in an invalid @email.address" });
        } catch (e: any) {
            error = e;
        }
        // wrong email address
        expect(error).to.be.instanceOf(UserCreateError);

        error = null;
        try {
            user = await client.createUser({ id: userId, password: "This is a test password" });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        let user2: User | null = null;
        try {
            user2 = await client.createUser({ id: userId, password: "This is a test password 1" });
        } catch (e: any) {
            error = e;
        }
        // user already exists
        expect(error).to.be.instanceOf(UserAlreadyExistsError);
        expect(user2!).to.be.equal(null);

        try {
            await user!.delete();
        } catch (e: any) {
            // nop
        }

    });

    it("07 create user successfully", async () => {
        const userId: string = "testUser07";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        // create user with email address
        try {
            user = await client.createUser({ id: userId, email: "h.t.borstenson@gmail.com" });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        // create user with email address and password
        error = null;
        try {
            user = await client.createUser({ id: userId, email: "h.t.borstenson@gmail.com", password: "this is a secure password" });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

    });

    it("08 enable disable user", async () => {
        const userId: string = "testUser08";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        // create user with password
        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        let isEnabled: boolean = false;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(true);

        // disable user
        try {
            await user?.disable();
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        isEnabled = true;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(false);

        // enable user
        try {
            await user?.enable();
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        isEnabled = false;
        isEnabled = await user!.isEnabled();
        expect(isEnabled).to.be.equal(true);

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

    });

    it("09 get users", async () => {

        let error: Error | null = null;
        const userCount: number = 5;
        const userIdPrefix: string = "testUser09-";
        const users: { id: string, user: User | null }[] = [];

        for (let i = 0; i < userCount; i++) {
            users.push({ id: userIdPrefix + (i + 1), user: null })
        }

        // delete the users first
        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                await client.deleteUser(users[i].id);
            } catch (e: any) {
                // nop
            }
        }

        for (let i = 0; i < userCount; i++) {
            error = null;
            // create user with password
            try {
                users[i].user = await client.createUser({ id: users[i].id, password: "this is a secure password" });
            } catch (e: any) {
                error = e;
            }
            expect(error).to.be.equal(null);
            expect(users[i].user).not.to.be.equal(null);
        }

        error = null;
        let result: User[] = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix)
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(userCount);

        error = null;
        result = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix, 2)
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(2);

        error = null;
        result = [];
        // get users
        try {
            result = await client.getUsers(userIdPrefix, 2, userCount - 1)
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);
        expect(result.length).to.be.equal(1);

        // get users with wrong limit
        try {
            await client.getUsers(userIdPrefix, -2)
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(QueryLimitError);

        // get users with wrong offset
        error = null;
        try {
            await client.getUsers(userIdPrefix, 1, -1)
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(QueryOffsetError);

        for (let i = 0; i < userCount; i++) {
            error = null;
            // delete user
            try {
                await client.deleteUser(users[i].id);
            } catch (e: any) {
                // nop
            }
        }

    });

    it("10 get and update user", async () => {

        const userId: string = "testUser10";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        // create user with password
        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        // ***********************
        // quota
        // ***********************
        let quota: IUserOptionsQuota;
        try {
            quota = await user!.getQuota();
        } catch (e: any) {
            error = e;
        }
        expect(error, "User getQuota expect no error").to.be.equal(null);
        expect(quota!.quota).to.be.equal(0);
        expect(quota!.relative).to.be.equal(0);
        expect(quota!.used).to.be.equal(0);

        let setValue: string = "1GB";
        error = null;
        try {
            await user!.setQuota(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            quota = await user!.getQuota();
        } catch (e: any) {
            error = e;
        }
        expect(error, "User getQuota expect no error").to.be.equal(null);
        expect(quota!.quota).to.be.equal(1024 * 1024 * 1024);

        setValue = "100MB";
        error = null;
        try {
            await user!.setQuota(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            quota = await user!.getQuota();
        } catch (e: any) {
            error = e;
        }
        expect(error, "User getQuota expect no error").to.be.equal(null);
        expect(quota!.quota).to.be.equal(1024 * 1024 * 100);

        let quotaUF: IUserQuotaUserFriendly;
        try {
            quotaUF = await user!.getQuotaUserFriendly();
            // console.log(JSON.stringify(quotaUF, null, 4));
        } catch (e: any) {
            error = e;
        }
        expect(error, "get getQuotaUserFriendly expect no error").to.be.equal(null);
        expect(quotaUF!.quota).to.be.equal("100 MB");

        // ***********************
        // last login
        // ***********************
        let lastlogin: Date | null = null;
        try {
            lastlogin = await user!.getLastLogin();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getLastLogin expect no error").to.be.equal(null);
        expect(lastlogin).to.be.equal(null);

        // ***********************
        // display name
        // ***********************
        setValue = "Horst-Thorsten Borstenson";
        let value: string = "";
        error = null;
        try {
            await user!.setDisplayName(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getDisplayName();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getDisplayName expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // ***********************
        // phone
        // ***********************
        setValue = "+49 1234 567";
        value = "";
        error = null;
        try {
            await user!.setPhone(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getPhone();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getPhone expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // ***********************
        // website
        // ***********************
        setValue = "http://borstenson.com";
        value = "";
        error = null;
        try {
            await user!.setWebsite(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getWebsite();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getWebsite expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // ***********************
        // twitter
        // ***********************
        setValue = "@real.h.t.borstenson";
        value = "";
        error = null;
        try {
            await user!.setTwitter(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getTwitter();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getTwitter expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // ***********************
        // address
        // ***********************
        setValue = "Fürst-Franz-Josef-Strasse 398\n9490 Vaduz\nLiechtenstein";
        value = "";
        error = null;
        try {
            await user!.setAddress(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getAddress();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getAddress expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // ***********************
        // language
        // ***********************
        setValue = "de";
        value = "";
        error = null;
        try {
            await user!.setLanguage(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getLanguage();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getLanguage expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // invalid language
        error = null;
        try {
            await user!.setLanguage("This Language is invalid");
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserUpdateError);

        // ***********************
        // locale
        // ***********************
        setValue = "de";
        value = "";
        error = null;
        try {
            await user!.setLocale(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getLocale();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getLocale expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // invalid locale
        error = null;
        try {
            await user!.setLocale("This locale is invalid");
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserUpdateError);

        // ***********************
        // password
        // ***********************
        setValue = "This is a secure password 1#99#!man1";
        value = "";
        error = null;
        try {
            await user!.setPassword(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        setValue = "xx";
        value = "";
        error = null;
        try {
            await user!.setPassword(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserUpdateError);

        // ***********************
        // resend welcome email should fail
        // ***********************
        error = null;
        try {
            await user!.resendWelcomeEmail()
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserResendWelcomeEmailError);

        // ***********************
        // email
        // ***********************
        setValue = "h.t.borstenson@gmail.com";
        value = "";
        error = null;
        try {
            await user!.setEmail(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        try {
            value = await user!.getEmail();
        } catch (e: any) {
            error = e;
        }

        expect(error, "User getEmail expect no error").to.be.equal(null);
        expect(value).to.be.equal(setValue);

        // invalid email address
        setValue = "invaid email address";
        value = "";
        try {
            await user!.setEmail(setValue);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserUpdateError);

        // ***********************
        // resend welcome email
        // ***********************
        error = null;
        try {
            await user!.resendWelcomeEmail()
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        // clean up user
        try {
            await user!.delete();
        } catch (e: any) {
            // nop
        }

    });

    it("11 get users with wrong response", async () => {
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                description: "Users get",
                method: "GET",
                url: "/ocs/v1.php/cloud/users",
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"usersXXX\":[\"holger\",\"htborstenson\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));

        let users;
        try {
            users = await lclient.getUsers();
        } catch (e: any) {
            expect(e.message, "expect no exception").to.be.equal(null);
        }
        expect(users).to.be.a("array");
        if (users) {
            expect(users.length, "expect an empty user list").to.be.equal(0);
        }

    });

    it("12 update non existing user", async () => {
        const userId: string = "testUser12";
        let error: Error | null = null;
        try {
            await client.updateUserProperty(userId, UserProperty.displayName, "Some Display Name");
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserNotFoundError);
    });

    it("13 login with new user", async () => {

        const userId: string = "testUser13";
        const password: string = "testUser13-password";
        let error: Error | null = null;
        let user: User | null = null;

        // ensure that the user is not available
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        // create user with password
        try {
            user = await client.createUser({ id: userId, password });
        } catch (e: any) {
            error = e;
        }
        // user should be created successfully
        expect(error).to.be.equal(null);
        expect(user!).not.to.be.equal(null);

        let quota: IUserOptionsQuota = await user!.getQuota();
        // console.log(quota);
        expect(quota.quota).to.be.equal(0);
        expect(quota.relative).to.be.equal(0);
        expect(quota.used).to.be.equal(0);

        try {
            await user!.setQuota("100MB")
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.equal(null);

        quota = await user!.getQuota();
        // console.log(quota);
        expect(quota.quota).to.be.equal(1024 * 1024 * 100);
        expect(quota.relative).to.be.equal(0);
        expect(quota.used).to.be.equal(0);

        if (recordingModeActive()) {
            const serverOptions: IServerOptions =
            {
                url: Environment.getNextcloudUrl(),
                basicAuth: {
                    username: Environment.getUserName(),
                    password: Environment.getPassword(),
                },
                logRequestResponse: Environment.getRecordingActiveIndicator(),
            };
            const ncserver: Server = new Server(serverOptions);
            ncserver.basicAuth.username = userId;
            ncserver.basicAuth.password = password;
            // login with the new user
            const newUserClient: Client = new Client(ncserver);
            // this will issue the first login
            try {
                await newUserClient.getQuota()
                // console.log(await newUserClient.getQuota());
            } catch (e: any) {
                error = e;
            }
            expect(error).to.be.equal(null);
        }

        // the quota values change after the first login
        user = await client.getUser(userId);
        quota = await user!.getQuota();
        // console.log(quota);
        expect(quota.quota).to.be.equal(1024 * 1024 * 100);
        expect(quota.relative).to.be.greaterThan(0);
        expect(quota.used).to.be.greaterThan(0);
        expect(quota.free).to.be.greaterThan(0);
        expect(quota.total).to.be.greaterThan(0);
        // for code coverage
        await user!.getQuotaUserFriendly();

        const lastLogin: Date | null = await user!.getLastLogin();
        // console.log(lastLogin);
        expect(lastLogin).not.to.be.equal(null);


        // clean up user
        try {
            await user!.delete();
        } catch (e: any) {
            // nop
        }

    });

    it("14 resend welcome email to non existing user", async () => {
        const userId: string = "testUser04";
        let error: Error | null = null;
        try {
            await client.resendWelcomeEmail(userId);
        } catch (e: any) {
            error = e;
        }
        expect(error).to.be.instanceOf(UserResendWelcomeEmailError);
    });


    it("20 get user groups", async () => {

        let exception;
        try {
            await client.getUserGroups("", -10);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(QueryLimitError);

        try {
            await client.getUserGroups("", 10, -1);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(QueryOffsetError);

        exception = null;
        let userGroups: UserGroup[];
        try {
            userGroups = await client.getUserGroups("no group should ever match this string", 0, 1);
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.equal(null);
        expect(userGroups!).not.to.be.equal(undefined);
        expect(userGroups!.length).to.be.equal(0);

        try {
            userGroups = await client.getUserGroups();
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.equal(null);
        expect(userGroups!).not.to.be.equal(undefined);

    });

    it("21 get create delete user group", async () => {

        const userGroupId = "test 11"
        let userGroup: UserGroup | null = null;
        let exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);

        if (userGroup) {
            try {
                await userGroup.delete();
            } catch (e: any) {
                exception = e;
            }
        }

        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        // now the user group is deleted
        try {
            await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupAlreadyExistsError);

        exception = null;
        try {
            userGroup = await client.getUserGroup(userGroupId + " this group should never exist")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroup).to.be.equal(null);

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup).not.to.be.equal(null);

        try {
            await userGroup!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

    });

    it("22 delete admin user group fails", async () => {

        const userGroupId = "admin"
        let userGroup: UserGroup | null = null;
        let exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);

        if (userGroup) {
            try {
                await userGroup.delete();
            } catch (e: any) {
                exception = e;
            }
        }

        expect(exception).to.be.instanceOf(UserGroupDeletionFailedError);

    });

    it("23 get members of user group", async () => {

        const userGroupId = "admin"
        let userGroupMembers: string[] = [];
        let exception = null;

        try {
            userGroupMembers = await client.getUserGroupMembers(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroupMembers!.length).to.be.greaterThan(0);

        try {
            await client.getUserGroupMembers(userGroupId + " this group should never exist")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        let userGroup: UserGroup | null = null;
        exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup, "get user group admin is always there").not.to.be.equal(null);

        try {
            await userGroup!.getMemberUserIds();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
    });

    it("24 get subadmins of user group", async () => {

        const userGroupId = "admin"
        let userGroupSubadamins: string[] = [];
        let exception = null;

        try {
            userGroupSubadamins = await client.getUserGroupSubadmins(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroupSubadamins!.length).to.be.greaterThan(-1);

        try {
            await client.getUserGroupSubadmins(userGroupId + " this group should never exist")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        let userGroup: UserGroup | null = null;
        exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup, "get user group admin is always there").not.to.be.equal(null);

        try {
            await userGroup!.getSubadminUserIds();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
    });

    it("25 delete non existing user group should fail", async () => {

        const userGroupId = "UserGroup25"
        let userGroup: UserGroup | null = null;
        let userGroup1: UserGroup | null = null;
        let exception = null;

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);

        if (userGroup) {
            try {
                await userGroup.delete();
            } catch (e: any) {
                exception = e;
            }
        }

        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        // now the user group is deleted
        try {
            await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            userGroup = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup).not.to.be.equal(null);

        try {
            userGroup1 = await client.getUserGroup(userGroupId)
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "get user group should not raise an exception").to.be.equal(null);
        expect(userGroup1).not.to.be.equal(null);

        try {
            await userGroup!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            await userGroup1!.delete();
        } catch (e: any) {
            exception = e;
        }
        // even if the user group has been deleted previously, the delete should not fail
        expect(exception).to.be.equal(null);

    });

    it("30 add user to user group and get user Groups", async () => {
        const userGroupId1 = "UserGroup30a"
        const userGroupId2 = "UserGroup30b"
        const userId = "TestUser30"
        let userGroup1: UserGroup;
        let userGroup2: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup1 = await client.createUserGroup(userGroupId1);
            userGroup2 = await client.createUserGroup(userGroupId2);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup1!).not.to.be.equal(undefined);
        expect(userGroup2!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await user!.addToMemberUserGroup(userGroup1!);
            await user!.addToMemberUserGroup(userGroup2!);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);

        let userGroups: UserGroup[] = [];
        try {
            userGroups = await user!.getMemberUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroups.length).to.be.equal(2);

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });
    it("31 add non existing user to non existing user group", async () => {
        const userGroupId = "UserGroup31"
        const userId = "TestUser31"
        let userGroup: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup = await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await client.addUserToMemberUserGroup(userId, "ThisGroupDoesNotExist")
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        exception = null;
        try {
            await client.addUserToMemberUserGroup("ThisUserNotExist", userGroupId)
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.instanceOf(UserNotFoundError);
        exception = null;

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });

    it("32 add user to user group with insufficient privileges", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.addUserToMemberUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(InsufficientPrivilegesError);
    });

    it("33 add user to user group with unkonwn error", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.addUserToMemberUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);
    });

    it("34 remove user from user group", async () => {
        const userGroupId = "UserGroup34"
        const userId = "TestUser34"
        let userGroup: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup = await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await user!.addToMemberUserGroup(userGroup!);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);

        let userGroups: UserGroup[] = [];
        try {
            userGroups = await user!.getMemberUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            await user!.removeFromMemberUserGroup(userGroup!)
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        userGroups = [];
        try {
            userGroups = await user!.getMemberUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroups.length).to.be.equal(0);

        // remove non existing user from user group
        try {
            await client.removeUserFromMemberUserGroup("nonExistingUser", userGroup!.id);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserNotFoundError);

        // remove non existing user group from user
        exception = null;
        try {
            await client.removeUserFromMemberUserGroup(user!.id, "nonExistingUserGroup");
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        exception = null;
        try {
            await user!.removeFromMemberUserGroup(userGroup!)
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });

    it("35 remove user from user group with insufficient privileges", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remove User someUserId from user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.removeUserFromMemberUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(InsufficientPrivilegesError);
    });

    it("36 remove user from user group with unkonwn error", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remove user someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.removeUserFromMemberUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);
    });

    it("37 get user group ids fails", async () => {
        let exception = null;

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "GET",
                description: "User Groups get",
            },
            response: {
                "body": "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"INVALIDgroups\":[]}}}",
                "contentType": "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let userGroups: UserGroup[] = [new UserGroup(client, "g1")];
        try {
            userGroups = await lclient.getUserGroups()
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroups.length).to.be.equal(0);
    });

    it("38 get user group members fails", async () => {
        let exception = null;

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups/admin",
                method: "GET",
                description: "User group get members"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"INVALIDusers\":[\"holger\",\"horst\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let member: string[] = ["u1"];
        try {
            member = await lclient.getUserGroupMembers("admin");
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(member.length).to.be.equal(0);
    });

    it("40 promote user to user group admin and get subadmin user groups", async () => {
        const userGroupId1 = "UserGroup40a"
        const userGroupId2 = "UserGroup40b"
        const userId = "TestUser40"
        let userGroup1: UserGroup;
        let userGroup2: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup1 = await client.createUserGroup(userGroupId1);
            userGroup2 = await client.createUserGroup(userGroupId2);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup1!).not.to.be.equal(undefined);
        expect(userGroup2!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await user!.promoteToUserGroupSubadmin(userGroup1!);
            await user!.promoteToUserGroupSubadmin(userGroup2!);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "adding a user to a user group should not raise an exception").to.be.equal(null);

        let userGroups: UserGroup[] = [];
        try {
            userGroups = await user!.getSubadminUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroups.length).to.be.equal(2);

        try {
            await client.getUserGroupSubadmins(userGroupId1)
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });

    it("41 promote non existing user to subadmin of non existing user group", async () => {
        const userGroupId = "UserGroup41"
        const userId = "TestUser41"
        let userGroup: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup = await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await client.promoteUserToUserGroupSubadmin(userId, "ThisGroupDoesNotExist")
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.instanceOf(UserGroupDoesNotExistError);

        exception = null;
        try {
            await client.promoteUserToUserGroupSubadmin("ThisUserNotExist", userGroupId)
        } catch (e: any) {
            exception = e;
        }

        expect(exception).to.be.instanceOf(UserNotFoundError);
        exception = null;

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });

    it("42 promote user to subadmin of user group with unkown error", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/subadmins",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":103,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.promoteUserToUserGroupSubadmin("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);
    });

    it("43 promote user to subadmin of user group with insufficient privileges", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/subadmins",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.promoteUserToUserGroupSubadmin("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(InsufficientPrivilegesError);
    });

    it("44 demote user from subadmin user group", async () => {
        const userGroupId = "UserGroup44"
        const userId = "TestUser44"
        let userGroup: UserGroup;
        let user: User;
        let exception = null;

        // cleanup and setup
        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            // ignore
        }

        try {
            userGroup = await client.createUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "create user group should not raise an exception").to.be.equal(null);
        expect(userGroup!).not.to.be.equal(undefined);

        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // ignore
        }

        try {
            user = await client.createUser({ id: userId, password: "this is a secure password" });
        } catch (e: any) {
            exception = e;
        }
        // user should be created successfully
        expect(exception).to.be.equal(null);
        expect(user!).not.to.be.equal(undefined);

        // the test:
        try {
            await user!.promoteToUserGroupSubadmin(userGroup!);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "promoting a user to as a subadmin user group should not raise an exception").to.be.equal(null);

        let userGroups: UserGroup[] = [];
        try {
            userGroups = await user!.getSubadminUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        try {
            await user!.demoteFromSubadminUserGroup(userGroup!)
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);

        userGroups = [];
        try {
            userGroups = await user!.getSubadminUserGroups();
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(userGroups.length).to.be.equal(0);

        // demote from non existing user from user group
        try {
            await client.demoteUserFromSubadminUserGroup("nonExistingUser", userGroup!.id);
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);

        // demote from non existing user group from user
        exception = null;
        try {
            await client.demoteUserFromSubadminUserGroup(user!.id, "nonExistingUserGroup");
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);

        exception = null;
        try {
            await user!.demoteFromSubadminUserGroup(userGroup!)
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);
        exception = null;

        // cleanup
        try {
            await user!.delete();
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user should not raise an exception").to.be.equal(null);

        try {
            await client.deleteUserGroup(userGroupId);
        } catch (e: any) {
            exception = e;
        }
        expect(exception, "delete user group should not raise an exception").to.be.equal(null);
    });

    it("45 demotes user from subadmin user group with insufficient privileges", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Demotes  user someUserId from user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":104,\"message\":\"\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.demoteUserFromSubadminUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(InsufficientPrivilegesError);
    });

    it("46 demote user from subadmin user group with unkonwn error", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "DELETE",
                description: "Remote user someUserId from subadmin user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"statuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.demoteUserFromSubadminUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(OperationFailedError);
    });

    it("48 get user group subadmins fails", async () => {
        let exception = null;

        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups/admin/subadmins",
                method: "GET",
                description: "User group get subadmins"
            },
            response: {
                "body": "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"dataINVALID\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        let member: string[] = ["u1"];
        try {
            member = await lclient.getUserGroupSubadmins("admin");
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.equal(null);
        expect(member.length).to.be.equal(0);
    });

    it("50 invalid service response", async () => {
        let exception = null;
        const entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/someUserId/groups",
                method: "POST",
                description: "Add User someUserId to user group someGroupId",
                body: "{\n    \"groupid\": \"someGroupId\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"failure\",\"INVALIDstatuscode\":999,\"message\":\"Some unknown error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        const lclient: Client = new Client(new FakeServer(entries));
        try {
            await lclient.addUserToMemberUserGroup("someUserId", "someGroupId")
        } catch (e: any) {
            exception = e;
        }
        expect(exception).to.be.instanceOf(InvalidServiceResponseFormatError);
    });

    it("60 User upsert", async () => {

        const userId: string = "testUser60"
        const userGroupId1: string = "testUserGroup1";
        const userGroupId2: string = "testUserGroup2";
        const userGroupId3: string = "testUserGroup3";
        const userGroupId4: string = "testUserGroup4";
        // cleanup
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
            await client.deleteUserGroup(userGroupId3);
            await client.deleteUserGroup(userGroupId4);
        } catch (e: any) {
            // nop
        }

        const userUpsertOptions: IUpsertUserOptions[] = [
            {
                id: userId,
            },
            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: false,
                resendWelcomeEmail: false,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 567",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: true,
                memberGroups: [userGroupId1, userGroupId2],
                subadminGroups: [userGroupId1, userGroupId2],
            },
            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: true,
                resendWelcomeEmail: false,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 567",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: false,
                memberGroups: [userGroupId1, userGroupId2, "admin"],
                subadminGroups: [userGroupId1, userGroupId2],
            },

            {
                id: userId,
                password: "ThisIsASecurePassword",
                displayName: "Horst-Thorsten Borstenson",
                email: "h.t.borstenson@gmail.com",
                enabled: false,
                resendWelcomeEmail: true,
                address: "at home",
                language: "en",
                locale: "de",
                phone: "+49 1234 5678",
                twitter: "@borsti",
                website: "http://borstenson.com",
                quota: "3 GB",
                superAdmin: true,
                memberGroups: [userGroupId2, userGroupId3, "admin"],
                subadminGroups: [userGroupId2, userGroupId3],
            },
            {
                id: userId,
            },
            {
                id: userId,
                password: "",
                displayName: "",
                email: "",
                enabled: false,
                resendWelcomeEmail: false,
                address: "",
                language: "",
                locale: "",
                phone: "",
                twitter: "",
                website: "",
                quota: "",
                superAdmin: false,
                memberGroups: [],
                subadminGroups: [],
            },
            {
                id: userId,
                password: "",
                displayName: "",
                email: "",
                enabled: false,
                resendWelcomeEmail: false,
                address: "",
                language: "",
                locale: "",
                phone: "",
                twitter: "",
                website: "",
                quota: "",
                memberGroups: [userGroupId2],
                subadminGroups: [userGroupId2, userGroupId4],
            }
        ];
        const report: IUpsertUserReport[] = await client.upsertUsers(userUpsertOptions);
        // @todo check some values
        // console.log(JSON.stringify(report, null, 4));

        // cleanup
        try {
            await client.deleteUser(userId);
        } catch (e: any) {
            // nop
        }

        try {
            await client.deleteUserGroup(userGroupId1);
            await client.deleteUserGroup(userGroupId2);
            await client.deleteUserGroup(userGroupId3);
            await client.deleteUserGroup(userGroupId4);
        } catch (e: any) {
            // nop
        }

    });

    it("61 User upsert fails", async () => {
        // only for code coverage
        const userId: string = "TestUser61";

        // disable fails ------------------------------
        let entries: RequestResponseLogEntry[] = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/disable",
                method: "PUT",
                description: "User ... disable"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        let lclient: Client = new Client(new FakeServer(entries));

        let userUpsertOptions: IUpsertUserOptions[] = [
            {
                id: userId,
                enabled: false,
            },
        ];
        let report: IUpsertUserReport[] = await lclient.upsertUsers(userUpsertOptions);

        // enable fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/enable",
                method: "PUT",
                description: "User ... disable"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                enabled: true,
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // demote from superadmin ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"admin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "DELETE",
                description: "Demote user from superadmin"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                superAdmin: false,
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // promote to superadmin ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "Promote user to superadmin"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":true,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                superAdmin: true,
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // remove group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // create user group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"some error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // add group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[\"newGroup\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "add user tp group",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                memberGroups: ["newGroup"],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);


        // demote from subadmin group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[\"subadminGroup\"],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"NOadmin\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: [],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // create subadmin user group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups",
                method: "POST",
                description: "UserGroup create",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"some error\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: ["newGroup"],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // add subadmin group fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/groups?search=newGroup",
                method: "GET",
                description: "User Groups get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"groups\":[\"newGroup\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId + "/groups",
                method: "POST",
                description: "add user tp group",
                body: "{\"groupid\":\"newGroup\"}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"XXdata\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                subadminGroups: ["newGroup"],
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

        // display name fails ------------------------------
        entries = [];
        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users?search=" + userId,
                method: "GET",
                description: "Users get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"users\":[\"" + userId + "\"]}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "GET",
                description: "User ... get"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":100,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":{\"enabled\":false,\"storageLocation\":\"\\/var\\/nextcloud_data\\/TestUser61\",\"id\":\"TestUser61\",\"lastLogin\":0,\"backend\":\"Database\",\"subadmin\":[],\"quota\":{\"quota\":\"none\",\"used\":0},\"email\":null,\"displayname\":\"TestUser61\",\"phone\":\"\",\"address\":\"\",\"website\":\"\",\"twitter\":\"\",\"groups\":[\"g1\"],\"language\":\"\",\"locale\":\"\",\"backendCapabilities\":{\"setDisplayName\":true,\"setPassword\":true}}}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        entries.push({
            request: {
                url: "/ocs/v1.php/cloud/users/" + userId,
                method: "PUT",
                description: "update user",
                body: "{\n    \"key\": \"xxkey\",\n    \"value\": \"xxvalue\"\n}"
            },
            response: {
                body: "{\"ocs\":{\"meta\":{\"status\":\"ok\",\"statuscode\":999,\"message\":\"OK\",\"totalitems\":\"\",\"itemsperpage\":\"\"},\"data\":[]}}",
                contentType: "application/json; charset=utf-8",
                status: 200,
            },
        });

        lclient = new Client(new FakeServer(entries));

        userUpsertOptions = [
            {
                id: userId,
                displayName: "someValue",
                email: "someValue",
                twitter: "someValue",
                phone: "someValue",
                address: "someValue",
                website: "someValue",
                resendWelcomeEmail: true,
            },
        ];
        report = await lclient.upsertUsers(userUpsertOptions);

    });

});
