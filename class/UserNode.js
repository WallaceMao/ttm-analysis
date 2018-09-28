'use strict'

class UserNode {
    constructor(id, teamId, suId) {
        this._type = 'user'
        this._id = id
        this._teamId = teamId
        this._suId = suId
        this._visitStatus = 'new'    //  'new', 'queued', 'visited'
    }

    get type() {
        return this._type
    }

    get id() {
        return this._id
    }

    get teamId() {
        return this._teamId
    }

    get suId() {
        return this._suId
    }

    set visitStatus(status) {
        this._visitStatus = status
    }
    get visitStatus() {
        return this._visitStatus
    }
}

module.exports = UserNode