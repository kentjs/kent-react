var React = require('react')
  , hashLoader = require('hash-loader')
  , find = require('array-find')
  , path = require('path')
  , Module = require('module')
  , assign = require('object-assign')
  , pendingRequests = {}
  , uid = 0

var DEFAULT_OPTIONS = {
	mountNodeId: 'app',
	moduleRoot: null,
	mountOnClient: true,
	detectDevice:false
}

module.exports = function(options){
	options = assign({}, DEFAULT_OPTIONS, options)

	return function middleware(next) {
		if (this.url.indexOf('/deviceInfo') === 0) {
			pendingRequests[this.query.requestId](JSON.parse(this.query.device))
			this.res.end('')
		} else {
			this.document = { doctype:'html' }
			this.render = createServerRenderer(this, options)
			this.props = {}
			next()
		}
	}
}
	
function createServerRenderer(ctx, options) {
	return function render(Component, props) {
		props = assign({}, ctx.props, props)

		var requestId = uid++

		ctx.document.meta = ctx.document.meta || []
		ctx.document.scripts = ctx.document.scripts || []
		
		ctx.document.meta.unshift({ charset:'UTF-8' })
		ctx.res.set('Content-Type', 'text/html; charset=utf-8')

		ctx.res.write(getDocumentStart(ctx.document, requestId, options))

		if(options.mountOnClient) {
			ctx.document.scripts.push(getInitScript(Component, props, options))
		}

		pendingRequests[requestId] = (device) => {
			delete pendingRequests[this.query.requestId]

			props.device = device

			var element = React.createElement(Component, props)

			if(options.mountOnClient) {
				ctx.res.write(React.renderToString(element))
			} else {
				ctx.res.write(React.renderToStaticMarkup(element))
			}

			ctx.res.end(getDocumentEnd(ctx.document, options))
		}

		if(!options.detectDevice) {
			pendingRequests[requestId]()
		}
	}
}

function getInitScript(Component, props, options) {
	var propsJson = JSON.stringify(JSON.stringify(props))
	  , componentPath = getComponentPath(Component)
	  , hash = hashLoader.getHash(componentPath, options.moduleRoot)

	return `
		<script>
			React.render(
				React.createElement(
					_modules['${hash}'], 
					JSON.parse(${propsJson})
				), 
				document.getElementById('${options.mountNodeId}')
			)
		</script>
	`
}

function getComponentPath(Component) {
	var rootDir = path.dirname(require.main.filename)
	  , callerFile = getCallerFile()
	  , callerModule
	  , componentModule

	callerModule = Module._cache[callerFile]
	try {
		componentModule = find(callerModule.children, function(module) {
			return module.exports == Component
		})

		return componentModule.filename
	} catch(e) {
		console.error(e, callerModule)
	}
}

function getCallerFile() {
	try {
		var err = new Error();
		var callerfile;
		var currentfile;

		Error.prepareStackTrace = function (err, stack) { return stack; };

		currentfile = err.stack.shift().getFileName();

		while (err.stack.length) {
		    callerfile = err.stack.shift().getFileName();

		    if(currentfile !== callerfile) return callerfile;
		}
	} catch (err) {}
	return undefined;
}

function getDocumentStart(document, requestId, options) {
	var meta = getMeta(document.meta)
	  , links = getLinks(document.links)
	  , styles = getStyles(document.styles)
	  , script = options.detectDevice ? getDeviceScript(requestId) : ''

	return `
		<!doctype ${document.doctype}>
		<html>
		<head>
			<title>${document.title}</title>
			${meta}
			${links}
			${styles}
			${script}
		</head>
		<body>
			<div id="${options.mountNodeId}">`
}

function getDocumentEnd(document, options) {
	var scripts = getScripts(document.scripts)

	return `
			</div>
			${scripts}
		</body>
		</html>
	`
}

function getDeviceScript(requestId) {
	return `
		<script type="text/javascript">
			(function () {
				var device = {
					width:document.documentElement.clientWidth,
					height:document.documentElement.clientHeight
				}

				var src = '/deviceInfo?requestId='+ ${requestId} + '&device=' + encodeURIComponent(JSON.stringify(device))

				document.write('<script type="text/javascript" src="'+src+'" ></'+'script>')
			})()
		</script>
	`
}

function getMeta(meta) {
	return (meta || []).map(function(meta) {
		if(typeof meta == 'object') {
			return '<meta ' + getProperties(meta) + ' />'
		} else if(/^\s*\<meta/.test(meta)) {
			return meta
		}
	}).join('')
}

function getLinks(links) {
	return (links || []).map(function(link) {
		if(typeof link == 'object') {
			return '<link ' + getProperties(link) + ' />'
		} else if(/^\s*\<link/.test(link)) {
			return link
		}
	}).join('')
}

function getStyles(styles) {
	return (styles || []).map(function(style) {
		if(typeof style == 'object') {
			return '<link rel="stylesheet" ' + getProperties(style) + ' />'
		} else if(/^\s*\<(style|link)/.test(style)) {
			return style
		} else {
			return '<link rel="stylesheet" href="' + style + '" />'
		}
	}).join('')
}

function getScripts(scripts) {
	return (scripts || []).map(function(script) {
		if(typeof script == 'object') {
			return '<script ' + getProperties(script) + '></script>'
		} else if(/^\s*\<script/.test(script)) {
			return script
		} else {
			return '<script src="' + script + '"></script>'
		}
	}).join('')
}

function getProperties(object) {
	return Object.keys(object).map(function(key) {
		return key+'="'+object[key]+'"'
	}).join(' ')
}