"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sendGithubMessage = void 0;
var rp = require("request-promise");
var functions = require("firebase-functions");
exports.sendGithubMessage = functions.https.onRequest(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var url, notificationTypeList, githubEventType, content, eventName, eventBody, eventUrl, senderName, body, body, options, result, err_1;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                // const baseUrl = "https://open.feishu.cn/open-apis/bot/v2/hook/7ec91c58-262e-48e4-8c1f-a23a1e2ac342"
                console.log(req.query);
                url = (_a = req.query.url) !== null && _a !== void 0 ? _a : "";
                if (url == "") {
                    res.status(400).send({ code: "can't find webhook url in query" });
                    return [2 /*return*/, 1];
                }
                notificationTypeList = ["pull_request", "release"];
                githubEventType = (_c = (_b = req.headers["x-github-event"]) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : " ";
                content = req.body;
                eventName = "";
                eventBody = "";
                eventUrl = content.repository != null ? (_d = content.repository.html_url) !== null && _d !== void 0 ? _d : "" : "";
                senderName = content.sender != null ? (_e = content.sender.login) !== null && _e !== void 0 ? _e : "Github" : "Github";
                switch (githubEventType) {
                    case "pull_request": {
                        body = content;
                        eventName = [body.sender.login, "just", body.action, "a pull request: ", body.pull_request.head.label, "->", body.pull_request.base.label].join(" ");
                        eventBody = body.pull_request.body;
                        eventUrl = body.pull_request.html_url;
                        break;
                    }
                    case "release": {
                        body = content;
                        eventName = [body.sender.login, "just", body.action, "a release: ", body.releas.tag_name].join(" ");
                        eventBody = "版本更新：" + body.releas.tag_name;
                        eventUrl = body.release.html_url;
                        break;
                    }
                    default: {
                        eventName = "暂不支持该消息类型";
                        console.log("暂不支持该消息类型");
                        break;
                    }
                }
                options = {
                    method: "POST",
                    uri: url.toString(),
                    body: getMessageBody(eventName, eventBody, eventUrl, senderName),
                    json: true
                };
                console.log(options);
                _f.label = 1;
            case 1:
                _f.trys.push([1, 5, , 6]);
                if (!notificationTypeList.includes(githubEventType)) return [3 /*break*/, 3];
                return [4 /*yield*/, rp(options)];
            case 2:
                result = _f.sent();
                res.status(200).send(result);
                return [2 /*return*/, result];
            case 3:
                res.status(200).send({ result: "Github EventType is unsupport" });
                _f.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_1 = _f.sent();
                console.log("=============error=============");
                console.log(err_1);
                return [2 /*return*/, { code: "some error happened, please see it in firebase console log" }];
            case 6: return [2 /*return*/];
        }
    });
}); });
var getMessageBody = function (eventName, eventBody, eventUrl, senderName) {
    var body = {
        "msg_type": "interactive",
        "card": {
            "config": {
                "wide_screen_mode": true
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": eventName
                },
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "markdown",
                    "content": eventBody + "\n[**Look it on Github**]($urlVal)\n<at id=all></at>",
                    "href": {
                        "urlVal": {
                            "url": eventUrl,
                            "android_url": eventUrl,
                            "ios_url": eventUrl,
                            "pc_url": eventUrl
                        }
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "img",
                            "img_key": "img_v2_cc1a5248-b289-457f-87f9-1061a325ab5g",
                            "alt": {
                                "tag": "plain_text",
                                "content": "GitHub"
                            }
                        },
                        {
                            "tag": "lark_md",
                            "content": "[" + senderName + "](https://github.com/" + senderName + ")"
                        },
                    ]
                },
            ]
        }
    };
    return body;
};
//# sourceMappingURL=github_notification.js.map