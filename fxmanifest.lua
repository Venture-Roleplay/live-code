fx_version 'bodacious'
game 'gta5'

author 'Whitigol'
version '1.0.0'

client_scripts {'dist/client.js', 'dist/client.lua'}
server_script 'dist/server.js'

files {'nui/**/*', 'stream/**/*'}

ui_page 'nui/index.html'

data_file 'DLC_ITYP_REQUEST' 'stream/**/*.ytyp'
