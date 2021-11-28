const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get(`/`, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(`/logo`, (req, res) => {
  const logo = path.join(__dirname, 'logo.png');
  const content = fs.readFileSync(logo, {
    encoding: 'base64',
  });
  res.set('Content-Type', 'image/png');
  res.send(Buffer.from(content, 'base64'));
  res.status(200).end();
});

app.get('/user', (req, res) => {
  res.send([
    {
      title: 'Github Webhook to Feishu',
      link: 'https://ahaclub.net',
    },
  ]);
});

app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  res.send({
    id: id,
    title: 'Github Webhook to Feishu',
    link: 'https://ahaclub.net',
  });
});

app.get('/404', (req, res) => {
  res.status(404).send('Not found');
});

app.get('/500', (req, res) => {
  res.status(500).send('Server Error');
});

// Error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('Internal Serverless Error');
});

// Web 类型云函数，只能监听 9000 端口
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});

app.get('/feishu', (req, res) => {
  var url, notificationTypeList, githubEventType, content, eventName, eventBody, eventUrl, senderName, body, body, options, result, err_1;
  var _a, _b, _c, _d, _e;
  return __generator(this, function (_f) {
    switch (_f.label) {
      case 0:
        // const baseUrl = "https://open.feishu.cn/open-apis/bot/v2/hook/7ec91c58-262e-48e4-8c1f-a23a1e2ac342"
        console.log(req.query);
        url = (_a = req.query.url) !== null && _a !== void 0 ? _a : "";
        if (url == "") {
          res.status(400).send({code: "can't find webhook url in query"});
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
        res.status(200).send({result: "Github EventType is unsupport"});
        _f.label = 4;
      case 4: return [3 /*break*/, 6];
      case 5:
        err_1 = _f.sent();
        console.log("=============error=============");
        console.log(err_1);
        return [2 /*return*/, {code: "some error happened, please see it in firebase console log"}];
      case 6: return [2 /*return*/];
    }
  });
});

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