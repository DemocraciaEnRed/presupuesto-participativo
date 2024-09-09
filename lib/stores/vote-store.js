import request from '../request/request'
import Store from './store/store'

class VoteStore extends Store {
  name () {
    return 'padron'
  }

  findAllSuffix () {
    return ''
  }

  hasVoted(dni) {
    return new Promise((resolve, reject) => {
      request
        .get(`/api/padron/check-voted/${dni}`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err)
          resolve(res.body && res.body.hasVoted)
        })
    })
    // return new Promise((resolve, reject) => {
    //   request
    //     .get(`/api/v2/votes/hasVoted/${dni}`)
    //     .end((err, res) => {
    //       if (err || !res.ok) return reject(err)
    //       resolve(res.body && res.body.hasVoted)
    //     })
    // })
  }

  sendVotes (ballot) {
    const promise = new Promise((resolve, reject) => {
      request
        .post(`/api/v2/votes/create`)
        .send(ballot)
        .end((err, res) => {
          if (err || !res.ok) return reject(err)

          resolve(res.body && res.body.vote)
        })
    })

    return promise
  }


}


export default new VoteStore()
