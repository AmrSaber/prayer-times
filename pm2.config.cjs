// PM2 configuration
module.exports = {
	apps: [
		{
			name: 'prayer',
			script: './build/index.js',
			exec_mode: 'cluster',
			instances: 2
		}
	]
};
