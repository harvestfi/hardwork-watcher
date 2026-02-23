import { Utils } from './'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const NAME = 'Farmer Chad'
const AVATAR = 'https://i.ibb.co/qxkL7cC/chad-icon.png'
const HEADERS = {
  'Content-type': 'application/json',
}

const rateLimit = 400
const DEBUG_SUFFIX = 'KEY'
const DEBUG_FILE = path.join(process.cwd(), 'output.json')

export class DiscordSender {
  private static lastSentMessageTs = 0

  public static async sendHardWork(msg: string, url: string) {
    const params = {
      username: NAME,
      avatar_url: AVATAR,
      embeds: [
        {
          color: 16776960,
          description: msg,
        },
      ],
    }
    await DiscordSender.send(url, params)
  }

  private static async send(url: string, params: any) {
    if (!url || url === '') return

    // DEBUG MODE
    if (url.endsWith(DEBUG_SUFFIX)) {
      DiscordSender.writeDebugOutput(url, params)
      return
    }

    // NORMAL DISCORD SEND
    if (DiscordSender.lastSentMessageTs + rateLimit > Date.now()) {
      console.log('rate limit reached with limit ms:', rateLimit)
      await Utils.sleep(rateLimit)
    }

    const http = axios.create()
    try {
      await http.post(url, params, { headers: HEADERS })
    } catch (e) {
      console.log('Error sending to Discord', e)
    }

    DiscordSender.lastSentMessageTs = Date.now()
  }

  private static writeDebugOutput(url: string, params: any) {
    const entry = {
      ts: new Date().toISOString(),
      url,
      payload: params,
    }

    let existing: any[] = []
    try {
      if (fs.existsSync(DEBUG_FILE)) {
        existing = JSON.parse(fs.readFileSync(DEBUG_FILE, 'utf8'))
      }
    } catch {
      existing = []
    }

    existing.push(entry)
    fs.writeFileSync(DEBUG_FILE, JSON.stringify(existing, null, 2))
  }
}