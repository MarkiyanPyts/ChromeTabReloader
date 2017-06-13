#Chrome tab reloader plugin
>**This is Livereload alternative for non localhost working environments. 
So if you work in cloud based environment where you can only see the code result after it uploads to server,
This plugin shall help you to reload the Chrome tab once your code is uploaded.**

>It shall work for you if you are using task runner like gulp,
In gulp you can use Node plugin server side https://www.npmjs.com/package/chrome-tab-reloader

>Also you need any other npm tool to pair us with https://www.npmjs.com/package/chrome-tab-reloader which uploads your code to server and gives you callback on this action with filename of a file which has just uploaded to server.

Here is an example of using chromeTabReloader in pair with `dwdav` and `dw-utils` plugins for Demandware platform:

```
var gulp = require("gulp"),
        dwdav = require('dwdav'),
        config = require('@tridnguyen/config'),
        gutil = require('gulp-util'),
        chromeTabReloader = require('chrome-tab-reloader'),
        tabReloaderInstance;

function upload(files) {
    var credentials = config('../dw.json', { caller: false });
    var server = dwdav(credentials);

    Promise.all(files.map(function(file) {
        return server.post(path.relative(process.cwd(), file));
    })).then(function() {
        tabReloaderInstance(files);
        gutil.log(gutil.colors.green('Uploaded ' + files.join(',') + ' to the server'));
    }).catch(function(err) {
        gutil.log(gutil.colors.red('Error uploading ' + files.join(','), err));
    });
}

var filesToWatchToUpload = [
        'some_app_of_yours/cartridge/**/*.{isml,json,properties,xml}',
        'some_app_of_yours/cartridge/scripts/**/*.{js,ds}',
        'some_app_of_yours/cartridge/static/**/*.{js,css,png,gif,jpg}',
        'some_app_of_yours_richUI/cartridge/**/*.{isml,json,properties,xml}',
        'some_app_of_yours_richUI/cartridge/scripts/**/*.{js,ds}',
        'some_app_of_yours_richUI/cartridge/static/**/*.{js,css,png,gif,jpg}'
    ];

gulp.task('watch:server', function() {
    tabReloaderInstance = new chromeTabReloader({
        port: 8001
    });

    gulp.watch(filesToWatchToUpload, { interval: 1000 }, function(event) {
        setTimeout(function() {
            upload([event.path]);
        }, 500);
    });
});
```

```dw.json``` if file generated with ```dw-utils init``` command.

```files``` is an array of file names of files being uploaded.

Once ```gulp watch:server``` command is on you will have tabReloader npm module waiting for chrome plugin to connect to it.

Once chromeTabReloader in installed in your browser you can click on the green circle icon in your extensions bar, it shall establish conncetion with running npm process.

The tab on which you where while activating plugin shall be the one to reload once new file upload is spotted. You can activate it for multiple tabs at once.



