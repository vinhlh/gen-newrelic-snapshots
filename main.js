const run = require('./run')

const accountId = 1232118

const aplicationIds = [33426321]

const timeRanges = [
  ['10 Nov 2018 21:00:00 GMT+0800', '11 Nov 2018 03:00:00 GMT+0800']
]

;(async () => {
  for (let applicationId of aplicationIds) {
    for (let timeRange of timeRanges) {
      const [start, end] = timeRange

      await run({
        accountId,
        applicationId,
        start,
        end
      })
    }
  }
})()
