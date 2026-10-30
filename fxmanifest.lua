name 'ai-vehicleshop'
author 'TGIANN'
version '0.1.0'
license 'GPL-3.0-only'
description 'Vehicle shops: catalog, preview, buying'
repository 'https://github.com/TGIANN/ai-vehicleshop'
fx_version 'cerulean'
game 'gta5'
node_version '22'

client_script 'dist/client.js'
server_script 'dist/server.js'
ui_page 'dist/web/index.html'

dependencies {
	'/onesync',
	'ai-core',
	'ai-vehicles',
}

files {
	'locales/*.json',
	'dist/web/assets/*.css',
	'dist/web/assets/*.js',
	'dist/web/assets/*.woff',
	'dist/web/assets/*.woff2',
	'dist/web/*.html',
	'data/settings.json',
	'data/catalog.json',
	'data/shops.json',
}
