var React = require('react')
  , assign = require('object-assign')

var DEFAULT_OPTIONS = {
	mountNodeId: 'app',
	moduleRoot: null
}

module.exports = function(options){
	options = assign({}, DEFAULT_OPTIONS, options)

	return function kentReact(next) {
		this.document = { doctype:'html' }
		this.render = createClientRenderer(this, next)
		this.props = {}
		next()
	}

	function createClientRenderer(ctx, next) {
		return function render(Component, props) {
			props = assign({}, ctx.props, props)

			var element = React.createElement(Component, props)
			  , mountNode = document.getElementById(options.mountNodeId)

			document.title = ctx.document.title

			React.render(element, mountNode)
			ctx.complete()
		}
	}
}