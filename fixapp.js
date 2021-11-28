const rp = require('request');


// forwardMessageFeishu()

exports.forwardMessageFeishu = function (req, res) {
  // function forwardMessageFeishu(req, res) {
  var url = req.query["url"]
  if (url == "") {
    res.status(400).send({code: "can't find webhook url in query"})
    return 1
  }
  var notificationTypeList = ["pull_request", "release"]

  var githubEventType = req.headers["x-github-event"]
  var payload = JSON.parse(req.body["payload"])
  if (payload == null) {
    console.log(req)
    res.status(400).send({code: "can't find body in request"})
    // res.status(400).send(req.body)
    return 1
  }
  let eventName = ""
  let eventBody = ""
  console.log(payload.pull_request)
  console.log(payload["sender"])

  let eventUrl = payload.repository != null ? payload.repository.html_url != null ? payload.repository.html_url : "" : ""
  const senderName = payload.sender != null ? payload.sender.login != null ? payload.sender.login : "Github" : "Github"

  switch (githubEventType) {
    case "pull_request": {
      const body = payload
      eventName = [body.sender.login, "just", body.action, "a PR: ", body.repository.name + ":", body.pull_request.head.label.split(":")[1], "->", body.pull_request.base.label.split(":")[1]].join(" ")
      eventBody = ["**" + body.pull_request.title + "**", body.pull_request.body].join("\n")
      eventUrl = body.pull_request.html_url
      break
    }
    case "release": {
      const body = payload
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
      const result = rp(options)
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
}

function getMessageBody(eventName, eventBody, eventUrl, senderName) {
  var body = {
    "msg_type": "interactive",
    "card": {
      "config": {
        "wide_screen_mode": true,
      },
      "header": {
        "title": {
          "tag": "plain_text",
          "content": eventName, // 标题内容
        },
        "template": "blue", // 标题主题颜色
      },
      "elements": [
        {
          "tag": "markdown",
          "content": eventBody + "\n[**Look it on Github**]($urlVal)", // if u want @all, add this: <at id=all></at>
          "href": {
            "urlVal": {
              "url": eventUrl,
              "android_url": eventUrl,
              "ios_url": eventUrl,
              "pc_url": eventUrl,
            },
          },
        },
        {
          "tag": "note",
          "elements": [
            {
              "tag": "img",
              "img_key": "img_v2_cc1a5248-b289-457f-87f9-1061a325ab5g",
              "alt": {
                "tag": "plain_text",
                "content": "GitHub",
              },
            },
            {
              "tag": "lark_md",
              "content": "[" + senderName + "](https://github.com/" + senderName + ")",
            },
          ],
        },
      ],
    },
  }
  return body;
};