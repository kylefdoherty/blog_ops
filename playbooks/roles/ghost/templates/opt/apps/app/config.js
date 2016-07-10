// {{ ansible_managed }}
// # Ghost Configuration
// Setup your Ghost install for various [environments](http://support.ghost.org/config/#about-environments).

// Full documentation can be found at http://support.ghost.org/config/

var path = require('path'),
    config;

config = {
    // ### Production
    // When running Ghost in the wild, use the production environment.
    // Configure your URL and mail settings here
    production: {
        url: 'http://{{ server_name }}',
        mail: {},
        database: {
            client: 'pg',
            connection: {
                host     : '{{ postgresql_ip }}',
                user     : '{{ postgresql_user }}',
                password : '{{ postgresql_password }}',
                database : '{{ database_name }}',
                charset  : 'utf8'
            }
        },
        server: {
            socket: {
                path: '/tmp/{{ app_name }}.sock',
                permissions: '0666'
            }
        },
        storage: {
            active: 'ghost-s3',
            'ghost-s3': {
                accessKeyId: '{{ aws_access_key_id }}',
                secretAccessKey: '{{ aws_secret_access_key }}',
                bucket: '{{ aws_storage_bucket_name }}',
                region: '{{ aws_storage_bucket_region }}',
                assetHost: 'http://{{ aws_storage_bucket_name }}.s3.amazonaws.com/'
            }
        },
    },
};

module.exports = config;
