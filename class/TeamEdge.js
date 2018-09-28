'use strict'

class TeamEdge {
    constructor(id, preNode, nextNode) {
        this._type = 'team'
        this._id = id
        this._preNode = preNode
        this._nextNode = nextNode
    }

    get type() {
        return this._type
    }

    get id() {
        return this._id
    }

    get preNode() {
        return this._preNode
    }

    get nextNode() {
        return this._nextNode
    }
}

module.exports = TeamEdge