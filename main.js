const run = require('./run')

const accountId = 1232118

const aplicationIds = {
  'costa-live-id': 33426277,
  'costa-live-ph': 33426321,
  'costa-live-my': 33426294,
  'costa-live-sg': 33426449,
  'costa-live-hk': 33426309,
  'costa-live-tw': 33426414,

  'solr-live-id': 22710978,
  'solr-live-ph': 22711159,
  'solr-live-my': 22711098,
  'solr-live-sg': 22711166,
  'solr-live-hk': 22710913,
  'solr-live-tw': 22711172
}

const timeRanges = [
  ['10 Nov 2018 21:00:00 GMT+0800', '11 Nov 2018 03:00:00 GMT+0800'],
  ['11 Nov 2018 08:00:00 GMT+0800', '11 Nov 2018 14:00:00 GMT+0800'],
  ['11 Nov 2018 20:00:00 GMT+0800', '12 Nov 2018 02:00:00 GMT+0800']
]

;(async () => {
  for (let applicationName of Object.keys(aplicationIds)) {
    for (let timeRange of timeRanges) {
      const [start, end] = timeRange

      await run({
        accountId,
        applicationId: aplicationIds[applicationName],
        applicationName,
        start,
        end
      })
    }
  }
})()
