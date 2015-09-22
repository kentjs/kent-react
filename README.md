# kent-react

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

render react components isomorphically using kent

## Usage

[![NPM](https://nodei.co/npm/kent-react.png)](https://www.npmjs.com/package/kent-react)

provides `this.render(Component, props)`, `this.document`, and `this.props`

```javascript

router.use(function(next) {
	this.document.title = 'My Site'

	this.document.scripts = [
		'https://cdnjs.cloudflare.com/ajax/libs/es6-promise/3.0.2/es6-promise.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/react/'+require('react').version+'/react-with-addons.min.js',
		'/dist/client.js'
	]

	this.document.styles = [
		'https://fonts.googleapis.com/css?family=Open+Sans:400,300,700,600',
		'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css',
		'/styles/core.css'
	]

	this.document.meta = [
		{ name:'viewport', content:'width=device-width, initial-scale=1' }
	]

	next()
})

```

## License

MIT, see [LICENSE.md](http://github.com/mlrawlings/kent-react/blob/master/LICENSE.md) for details.
