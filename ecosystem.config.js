module.exports = {
	apps: [
		{
			name: 'wemakeservices',
            script: './server/index.js',
            env: {
                "NODE_ENV": "production"
            }
		}
	]
};