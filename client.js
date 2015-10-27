var React = require('react')
  , ContextWrapper = require('./context-wrapper')
  , assign = require('object-assign')

var DEFAULT_OPTIONS = {
	mountNodeId: 'app',
	moduleRoot: null,
	contextTypes: {}
}

module.exports = function(options){
	options = assign({}, DEFAULT_OPTIONS, options)

	ContextWrapper.childContextTypes = options.contextTypes

	return function kentReact(next) {
		this.document = { doctype:'html' }
		this.render = createClientRenderer(this, next)
		this.props = {}
		this.context = {}
		next()
	}

	function createClientRenderer(ctx, next) {
		return function render(Component, props) {
			props = assign({}, ctx.props, props)

			var mountNode = document.getElementById(options.mountNodeId)
			  , element = React.createElement(ContextWrapper, {
					children:React.createElement(Component, props),
					context:ctx.context
				})

			document.title = ctx.document.title

			React.render(element, mountNode)
			ctx.complete()
		}
	}
}