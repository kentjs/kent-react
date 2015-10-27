"use strict";

var React = require('react')

class ContextWrapper extends React.Component {
    getChildContext() {
        return this.props.context
    }
    render() {
        return this.props.children
    }
}

module.exports = ContextWrapper
