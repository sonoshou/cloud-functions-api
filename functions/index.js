const functions = require('firebase-functions')
const request = require('request')
require('date-utils')
const moment = require('moment')

gasUrl = 'https://script.google.com/macros/s/AKfycbzeZwH8V7Dxmq82jtnHS8T0hxGq4ZyJNH6SNWVhQGM0LLzVI69k/exec'

exports.users = functions.https.onRequest((req, res) => {
  var options
  if (req.path === "/") {
    switch (req.method) {
      case 'GET':
        options = {
            url: gasUrl,
            method: 'GET',
            json: true
        }
        request(options, function (error, response, body) {
          body = toUsersJson(body)
          res.status(200).send(body)
        })
        break
      case 'POST':
        req.body.method = 'POST'
        var dt = new Date()
        dt.setTime(dt.getTime() + 32400000) // 1000 * 60 * 60 * 9(hour)
        req.body.datetime = dt.toFormat("YYYY-MM-DD HH24:MI:SS")
        options = {
            url: gasUrl,
            method: 'POST',
            form: JSON.stringify(req.body),
            followAllRedirects: true,
            json: true
        }
        request(options, function (error, response, body) {
          body = toUserJson(body)
          res.status(201).send(body)
        })
        break
      default:
        res.status(405).end("Method Not Allowed")
        break
    }
  }

  let pattern = /^\/\d+$/
  if (req.path.match(pattern)) {
    let target = Number(req.path.slice(1))
    switch (req.method) {
      case 'GET':
        options = {
            url: gasUrl,
            method: 'GET',
            qs: {
              index: target
            },
            json: true
        }
        request(options, function (error, response, body) {
          body = toUserJson(body)
          res.status(200).send(body)
        })
        break
      case 'PUT':
        req.body.method = 'PUT'
        req.body.index = target
        options = {
            url: gasUrl,
            method: 'POST',
            form: JSON.stringify(req.body),
            followAllRedirects: true,
            json: true
        }
        request(options, function (error, response, body) {
          res.status(204).send()
        })
        break
      case 'PATCH':
        req.body.method = 'PATCH'
        req.body.index = target
        options = {
            url: gasUrl,
            method: 'POST',
            form: JSON.stringify(req.body),
            followAllRedirects: true,
            json: true
        }
        console.log(req.body)
        request(options, function (error, response, body) {
          res.status(204).send()
        })
        break
      case 'DELETE':
        req.body.method = 'DELETE'
        req.body.index = target
        options = {
            url: gasUrl,
            method: 'POST',
            form: JSON.stringify(req.body),
            followAllRedirects: true,
            json: true
        }
        request(options, function (error, response, body) {
          res.status(204).send()
        })
        break
      default:
        res.status(405).end("Method Not Allowed")
        break
    }
  }
})

function toUserJson(body) {
  var hash = {}
  body.forEach(function (item) {
    hash =
      { index: item[0],
        id: item[1],
        name: item[2],
        sex: item[3],
        age: item[4],
        // GAS上でJSON.stringifyを使って日付を取得すると、ISO8601形式（UTC形式）となってしまう。
        // moment.jsでISO8601形式をパースして9時間（日本時間）を足す。
        datetime: moment(item[5]).add(9, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        is_deleted: item[6] }
  })
  return hash
}

function toUsersJson(body) {
  var dicts = new Array()
  body.forEach(function (item) {
    dicts.push(
      { index: item[0],
        id: item[1],
        name: item[2],
        sex: item[3],
        age: item[4],
        datetime: moment(item[5]).add(9, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        is_deleted: item[6] }
    )
  })
  return dicts
}

exports.batch = functions.https.onRequest((req, res) => {
  let pattern = /^\/\d+$/
  if (req.path.match(pattern)) {
    let target = Number(req.path.slice(1))
    switch (req.method) {
      case 'PATCH':
        req.body.method = 'PATCH'
        req.body.index = target
        var dt = new Date()
        dt.setTime(dt.getTime() + 32400000) // 1000 * 60 * 60 * 9(hour)
        req.body.datetime = dt.toFormat("YYYY-MM-DD HH24:MI:SS")
        console.log(JSON.stringify(req.body))
        options = {
            url: gasUrl,
            method: 'POST',
            form: JSON.stringify(req.body),
            followAllRedirects: true,
            json: true
        }
        request(options, function (error, response, body) {
          res.status(204).send()
        })
        break
      default:
        res.status(405).end("Method Not Allowed")
        break
    }
  }
})
