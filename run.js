const puppeteer = require('puppeteer-core')
const fs = require('fs')

const ARTIFACTS_DIR = 'artifacts'

const ALL_SLASHES = /\//g

const makeGenScreenshotPath = (subDir) => {
  const dir = ARTIFACTS_DIR + '/' + subDir + '/'

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  return name => ({
    path: dir + name.replace(ALL_SLASHES, '.') + '.png',
    fullPage: true
  })
}

const makeGenNewRelicPage = (accountId, applicationId, start, end) => (page = '') =>
  `https://rpm.newrelic.com/accounts/${accountId}/applications/${applicationId}${page}?tw%5Bend%5D=${end}&tw%5Bstart%5D=${start}`

const toTimestamp = dateStr => Math.floor(new Date(dateStr) / 1000)

const run = async ({ accountId, applicationId, start, end }) => {
  const genRelicPage = makeGenNewRelicPage(
    accountId,
    applicationId,
    toTimestamp(start),
    toTimestamp(end)
  )
  const subDir = [accountId, applicationId, start, end].join(' > ')
  const genScreenshotPath = makeGenScreenshotPath(subDir)
  const overviewPage = genRelicPage()

  console.warn(`Visiting NR accountId = ${accountId}, applicationId = ${applicationId}, start = ${start}, end = ${end}`)
  console.warn(overviewPage)

  const browser = await puppeteer.connect({
    /**
     * Start your Chrome in debugging mode, and get ws endpoint
     * "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" --remote-debugging-port=9222
     */
    browserWSEndpoint: process.env.WS_ENDPOINT,
    defaultViewport: {
      width: 1280,
      height: 960
    }
  })
  const pages = await browser.pages()

  if (!pages.length) {
    throw new Error('You need to open your New Relic transaction page')
  }

  const page = pages[0]

  await page.goto(overviewPage)
  await page.screenshot(genScreenshotPath('overview'))

  const transactionPage = genRelicPage('/transactions')
  await page.goto(transactionPage)
  await page.screenshot(genScreenshotPath('transactions'))

  const transactionCount = await page.$$eval(
    '.app_tier_alone',
    items => items.length
  )

  for (let index of [...Array(transactionCount).keys()]) {
    console.warn(`Clicking transaction ${index}`)

    await Promise.all([
      page.click(`.app_tier_alone:nth-child(${index + 1}) a`),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
    ])

    const transactionName = await page.$eval(
      'h2.section.with_corner_button',
      element => {
        const ALL_LINE_BREAKS_AT_BEGINNING_AND_ENDING = /^\s+|\s+$/g
        return element.textContent.replace(
          ALL_LINE_BREAKS_AT_BEGINNING_AND_ENDING,
          ''
        )
      }
    )

    console.warn(`Taking a screenshot of ${transactionName}`)
    await page.screenshot(genScreenshotPath('transactions' + transactionName))
  }

  browser.disconnect()
}

module.exports = run
