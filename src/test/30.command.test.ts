// nextcloud-node-client command tests

import { expect, use } from "chai";
import "mocha";
import {
    Client,
    DownloadFolderCommand,
    DownloadFolderCommandOptions,
    UploadFilesCommand,
    SourceTargetFileNames,
    UploadFolderCommand,
    FileSystemFolder,
    IFileNameFormats,
    CommandStatus,
    UploadFilesCommandOptions,
    UploadFolderCommandOptions,
    File,
    Folder,
    GetFilesRecursivelyCommandOptions,
    CommandAlreadyExecutedError,
} from "../client";
import { getNextcloudClient } from "./testUtils";
import GetFilesRecursivelyCommand from "../command/getFilesRecursivelyCommand";

let client: Client;

// tslint:disable-next-line:only-arrow-functions
// tslint:disable-next-line:space-before-function-paren
describe("30-NEXCLOUD-NODE-COMMAND", function () {

    // tslint:disable-next-line:space-before-function-paren
    beforeEach(async function () {
        if (this.currentTest && this.currentTest.parent) {
            client = await getNextcloudClient(this.currentTest.parent.title + "/" + this.currentTest.title);
        }
    });

    this.timeout(1 * 60 * 10000);

    it("01 execute upload folder command", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/02/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();

        const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return `${targetFolderName}${fileNames.targetFileName}` };
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        expect(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);
        const bytesUploaded = uc.getBytesUploaded();
        expect(bytesUploaded, "expect a certain number of bytesUploaded").to.be.greaterThan(3000000);

    });

    it("02 execute upload files command", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/02/uploadFilesCommand";
        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const fileNames: IFileNameFormats[] = await fsf.getFileNames();

        const files: SourceTargetFileNames[] = [];
        for (const fileNameFormat of fileNames) {
            files.push({ sourceFileName: fileNameFormat.absolute, targetFileName: `${targetFolderName}${fileNameFormat.relative}` });
        }
        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        // console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        expect(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("03 execute upload files command fails with invalid source file name", async () => {

        const sourceFileName: string = "./does/not/exist.txt";
        const targetFileName: string = "/test/30/03/uploadFilesCommand";

        const files: SourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        let alreadyCalled = false;
        while (uc.isFinished() !== true) {

            // only for code coverage
            // if command is running this should not have an effect
            if (!alreadyCalled) {
                uc.execute();
                alreadyCalled = true;
            }

            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());

        expect(uc.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        expect(uc.getStatus(), "command should fail").to.be.equal(CommandStatus.failed);

    });

    it("04 execute upload files command fails with invalid target file name", async () => {

        const sourceFileName: string = "./src/test/data/Borstenson/Company/Borstenson Company Profile.pdf";
        const targetFileName: string = " ";

        const files: SourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());

        expect(uc.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        expect(uc.getStatus(), "command should fail").to.be.equal(CommandStatus.failed);

    });

    it("05 execute upload files command with file processing callback after upload", async () => {

        const baseName: string = "Borstenson Company Profile.pdf";
        const sourceFileName: string = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName: string = "/test/30/05/uploadFilesCommand/" + baseName;
        const processFileAfterUpload = async (file: File): Promise<void> => {
            expect(file.baseName).to.be.equal(baseName);
        };

        const files: SourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());

        expect(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResultMetaData().messages.length, "result should contain one message").to.be.equal(1);
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("06 execute upload files command should fail in callback function", async () => {

        const baseName: string = "Borstenson Company Profile.pdf";
        const sourceFileName: string = "./src/test/data/Borstenson/Company/" + baseName;
        const targetFileName: string = "/test/30/06/uploadFilesCommand/" + baseName;
        const errorMessage: string = "This is an error messsage";
        const processFileAfterUpload = async (file: File): Promise<void> => {
            throw new Error(errorMessage);
        };

        const files: SourceTargetFileNames[] = [];
        files.push({ sourceFileName, targetFileName });

        const options: UploadFilesCommandOptions = { files, processFileAfterUpload };
        const uc: UploadFilesCommand = new UploadFilesCommand(client, options);

        //        console.log(files);
        // do not place an await here
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());

        expect(uc.getResultMetaData().errors.length, "result should contain one error").to.be.equal(1);
        expect(uc.getResultMetaData().errors[0]).to.be.equal(errorMessage);
        expect(uc.getStatus(), "command should be fail").to.be.equal(CommandStatus.failed);

    });

    it("07 execute upload folder command with default target file name processing", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/07/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        expect(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResultMetaData().messages.length, "result should contain messages").to.be.greaterThan(0)
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("08 execute upload folder command filtering all target names", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/08/uploadFilesCommand";

        const fsf: FileSystemFolder = new FileSystemFolder(sourceFolderName);
        const folderFileNames: IFileNameFormats[] = await fsf.getFileNames();

        const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return "" };
        const options: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        expect(uc.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(uc.getResultMetaData().messages.length, "result should contain messages").to.be.equal(0)
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

    });

    it("09 execute upload folder command with non exisiting folder", async () => {

        const sourceFolderName: string = "./this/folder/does/not/exist";
        const targetFolderName: string = "/test/30/09/uploadFolderCommand";

        const options: UploadFolderCommandOptions = { folderName: sourceFolderName };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, options);
        uc.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (uc.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(uc.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result", uc.getResultMetaData());
        expect(uc.getResultMetaData().errors.length, "result should contain one error").to.be.equal(1);
        expect(uc.getResultMetaData().messages.length, "result should contain messages").to.be.equal(0)
        expect(uc.getStatus(), "command should be successfull").to.be.equal(CommandStatus.failed);

    });

    it("10 get files recursively", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/10/GetFilesRecursivelyCommand";
        let sourceFolder: Folder | null = await client.getFolder(targetFolderName);
        if (sourceFolder) {
            await sourceFolder.delete();
        }

        // create the test files first
        const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return `${targetFolderName}${fileNames.targetFileName}` };
        const ucfOptions: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, ucfOptions);
        await uc.execute();

        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(uc.getResultMetaData()));

        // const sourceFolder: Folder = await client.getRootFolder();

        sourceFolder = await client.getFolder(targetFolderName);
        expect(sourceFolder).not.to.be.equal(null);

        const options: GetFilesRecursivelyCommandOptions = { sourceFolder: sourceFolder! };
        const command: GetFilesRecursivelyCommand = new GetFilesRecursivelyCommand(client, options);
        command.execute();

        async function sleep(seconds: number) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        while (command.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(command.getPercentCompleted() + "%");
            await sleep(0.1);
        }
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResult()));
        expect(command.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(command.getResultMetaData().messages.length, "result should contain messages").to.be.equal(1)
        expect(command.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

        const files: File[] = command.getFiles();
        expect(files.length).to.be.equal(14);

        // codecoverage check double execution
        let error: Error | null = null
        try {
            await command.execute();
        } catch (e: any) {
            error = e;
        }
        expect(error, "it should not be possible to execute a command again").to.be.instanceOf(CommandAlreadyExecutedError);

        // check filter function
        const fileFilterFunction = (file: File): File | null => {

            if (file.mime === "application/pdf") {
                return file;
            }

            if (file.mime === "image/jpeg") {
                return file;
            }
            return null;

        }

        const options2: GetFilesRecursivelyCommandOptions = {
            sourceFolder: sourceFolder!,
            filterFile: fileFilterFunction,
        };

        const command2: GetFilesRecursivelyCommand = new GetFilesRecursivelyCommand(client, options2);
        await command2.execute();

        const filteredFiles: File[] = command2.getFiles();
        // 2xpdf and 1xjpg
        expect(filteredFiles.length, "expect the number of filtered files is 3").to.be.equal(3);

        // delete files
        await sourceFolder!.delete();

    });

    it("11 get files recursively fails", async () => {

        const notARealFolder = {};
        // this line will cause the error
        const options: GetFilesRecursivelyCommandOptions = { sourceFolder: notARealFolder as Folder };
        const command: GetFilesRecursivelyCommand = new GetFilesRecursivelyCommand(client, options);
        await command.execute();

        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResultMetaData()));
        expect(command.getResultMetaData().errors.length, "result should contain an error").to.be.equal(1);
        expect(command.getResultMetaData().messages.length, "result should contain no messages").to.be.equal(0)
        expect(command.getStatus(), "command should be successfull").to.be.equal(CommandStatus.failed);

    });

    it("12 download files recursively", async () => {

        const sourceFolderName: string = "./src/test/data/Borstenson";
        const targetFolderName: string = "/test/30/12/DownloadFilesRecursivelyCommand";
        let sourceFolder: Folder | null = await client.getFolder(targetFolderName);
        if (sourceFolder) {
            await sourceFolder.delete();
        }

        // create the test files first
        const getTargetFileNameBeforeUpload = (fileNames: SourceTargetFileNames): string => { return `${targetFolderName}${fileNames.targetFileName}` };
        const ucfOptions: UploadFolderCommandOptions = { folderName: sourceFolderName, getTargetFileNameBeforeUpload };
        const uc: UploadFolderCommand = new UploadFolderCommand(client, ucfOptions);
        await uc.execute();

        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(uc.getResultMetaData()));

        // const sourceFolder: Folder = await client.getRootFolder();

        sourceFolder = await client.getFolder(targetFolderName);
        expect(sourceFolder).not.to.be.equal(null);

        // check filter function
        const fileFilterFunction = (file: File): File | null => {
            if (file.mime === "application/pdf" || file.mime === "image/jpeg") {
                return file;
            }
            return null;
        }

        const options: DownloadFolderCommandOptions =
        {
            sourceFolder: sourceFolder!,
            filterFile: fileFilterFunction,
            getTargetFileNameBeforeDownload:
                (fileNames: SourceTargetFileNames): string => { return "./tmp/" + fileNames.targetFileName }
        };
        const command: DownloadFolderCommand = new DownloadFolderCommand(client, options);
        command.execute();

        while (command.isFinished() !== true) {
            // tslint:disable-next-line:no-console
            // console.log(command.getPercentCompleted() + " %");
            await (async () => { return new Promise(resolve => setTimeout(resolve, 100)) })();
        }
        // tslint:disable-next-line:no-console
        // console.log("result: ", JSON.stringify(command.getResultMetaData()));

        expect(command.getResultMetaData().errors.length, "result should contain no errors").to.be.equal(0);
        expect(command.getResultMetaData().messages.length, "result should contain messages").to.be.equal(1)
        expect(command.getStatus(), "command should be successfull").to.be.equal(CommandStatus.success);

        expect(command.getBytesDownloaded()).to.be.greaterThan(100);

        // check if error handling works
        const options2: DownloadFolderCommandOptions =
        {
            sourceFolder: sourceFolder!,
            filterFile: fileFilterFunction,
            getTargetFileNameBeforeDownload:
                (fileNames: SourceTargetFileNames): string => "tt:/\0/invalid filename/" + fileNames.targetFileName
        };
        const command2: DownloadFolderCommand = new DownloadFolderCommand(client, options2);
        await command2.execute();

        expect(command2.getResultMetaData().errors.length, "result should contain errors").to.be.equal(1);
        expect(command2.getResultMetaData().messages.length, "result should contain no messages").to.be.equal(0)
        expect(command2.getStatus(), "command should be successfull").to.be.equal(CommandStatus.failed);
        // console.log(command2.getResultMetaData().errors);
        // delete files
        await sourceFolder!.delete();

    });

});
