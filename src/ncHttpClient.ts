// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import debugFactory from "debug";
import HttpProxyAgent from "http-proxy-agent";
import fetch from "node-fetch";
import {
    Headers,
    RequestInit,
    Response,
} from "node-fetch";
import RequestResponseLog from "./requestResponseLog";
import RequestResponseLogEntry, { RequestLogEntry, ResponseLogEntry } from "./requestResponseLogEntry";

const debug = debugFactory("NCHttpClient");

export interface IRequestContext {
    "description"?: string;
}

export interface IProxy {
    "host": string;
    "port": string;
    "protocol": string;
    "secureProxy": boolean;
    "proxyAuthorizationHeader"?: string;
}

export interface INCHttpClientOptions {
    "authorizationHeader"?: string;
    "logRequestResponse"?: boolean;
    "proxy"?: IProxy;
    "origin"?: string;
}
export class NCHttpClient {
    private proxy?: IProxy;
    private authorizationHeader?: string;
    private logRequestResponse: boolean;
    private origin: string;

    public constructor(options: INCHttpClientOptions) {
        debug("constructor");
        this.authorizationHeader = options.authorizationHeader;
        this.proxy = options.proxy;
        this.logRequestResponse = options.logRequestResponse || false;
        this.origin = options.origin || "";
    }
    public async getHttpResponse(url: string, requestInit: RequestInit, expectedHttpStatusCode: number[], context: IRequestContext): Promise<Response> {

        if (!requestInit.headers) {
            requestInit.headers = new Headers();
        }

        if (!requestInit.method) {
            requestInit.method = "UNDEFINED";
        }

        if (!context.description) {
            context.description = "";
        }

        if (this.authorizationHeader) {
            (requestInit.headers as Headers).append("Authorization", this.authorizationHeader);
        }
        (requestInit.headers as Headers).append("User-Agent", "nextcloud-node-client");

        // set the proxy
        if (this.proxy) {
            debug("proxy agent used");
            const proxyAgent = new HttpProxyAgent({
                host: this.proxy.host,
                port: this.proxy.port,
                protocol: this.proxy.protocol,
            });
            requestInit.agent = proxyAgent;
            if (this.proxy.proxyAuthorizationHeader) {
                (requestInit.headers as Headers).append("Proxy-Authorization", this.proxy.proxyAuthorizationHeader);
            }
        }

        debug("getHttpResponse request header %O", requestInit.headers);
        debug("getHttpResponse url:%s, %O", url, requestInit);

        const response: Response = await fetch(url, requestInit);

        if (this.logRequestResponse) {
            const responseText = await response.text();

            // overwrite response functions as the body uses a stearm object...
            response.text = async () => {
                return responseText;
            };

            response.json = async () => {
                return JSON.parse(responseText);
            };

            response.buffer = async () => {
                return Buffer.from(responseText);
            };

            const reqLogEntry: RequestLogEntry =
                new RequestLogEntry(url.replace(this.origin, ""),
                    requestInit.method, context.description,
                    requestInit.body as string);

            const resLogEntry: ResponseLogEntry =
                new ResponseLogEntry(response.status,
                    await response.text(),
                    response.headers.get("content-type"),
                    response.headers.get("Content-Location") || "");

            const rrLog: RequestResponseLog = RequestResponseLog.getInstance();
            await rrLog.addEntry(new RequestResponseLogEntry(reqLogEntry, resLogEntry));
        }

        const responseContentType: string | null = response.headers.get("content-type");

        if (expectedHttpStatusCode.indexOf(response.status) === -1) {
            debug("getHttpResponse unexpected status response %s", response.status + " " + response.statusText);
            debug("getHttpResponse description %s", context.description);
            debug("getHttpResponse expected %s", expectedHttpStatusCode.join(","));
            debug("getHttpResponse headers %s", JSON.stringify(response.headers, null, 4));
            debug("getHttpResponse request body %s", requestInit.body);
            debug("getHttpResponse text %s", await response.text());
            throw new Error(`HTTP response status ${response.status} not expected. Expected status: ${expectedHttpStatusCode.join(",")} - status text: ${response.statusText}`);
        }
        return response;
    }

}
