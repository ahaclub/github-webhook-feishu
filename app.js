const express = require('express');
const path = require('path');
const fs = require('fs');
const rp = require("request-promise");
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
  // const baseUrl = "https://open.feishu.cn/open-apis/bot/v2/hook/7ec91c58-262e-48e4-8c1f-a23a1e2ac342"
  console.log(req.query)
  const url = req.query.url ?? ""
  if (url == "") {
    res.status(400).send({code: "can't find webhook url in query"})
    return 1
  }
  const notificationTypeList = ["pull_request", "release"]

  const githubEventType = req.headers["x-github-event"]?.toString() ?? " "
  const content = req.body
  let eventName = ""
  let eventBody = ""
  let eventUrl = content.repository != null ? content.repository.html_url ?? "" : ""
  const senderName = content.sender != null ? content.sender.login ?? "Github" : "Github"

  switch (githubEventType) {
    case "pull_request": {
      const body = content
      eventName = [body.sender.login, "just", body.action, "a PR: ", body.pull_request.head.label, "->", body.pull_request.base.label].join(" ")
      eventBody = body.pull_request.body
      eventUrl = body.pull_request.html_url
      break
    }
    case "release": {
      const body = content
      eventName = [body.sender.login, "just", body.action, "a release: ", body.releas.tag_name].join(" ")
      eventBody = "版本更新：" + body.releas.tag_name
      eventUrl = body.release.html_url
      break
    }
    default: {
      eventName = "暂不支持该消息类型"
      console.log("暂不支持该消息类型")
      break
    }
  }

  const options = {
    method: "POST",
    uri: url.toString(),
    body: getMessageBody(eventName, eventBody, eventUrl, senderName),
    json: true,

  }


  console.log(options)
  try {
    if (notificationTypeList.includes(githubEventType)) {
      const result = await rp(options)
      res.status(200).send(result)
      return result
    } else {
      res.status(200).send({result: "Github EventType is unsupport"})
    }
  } catch (err) {
    console.log("=============error=============")
    console.log(err)
    return {code: "some error happened, please see it in firebase console log"}
  }
})

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