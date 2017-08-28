var gulp            = require('gulp'),
    gutil           = require('gulp-util'),
    templateCache   = require('gulp-angular-templatecache'),
    concat          = require('gulp-concat'),
    cleanCSS        = require('gulp-clean-css'),
    uglify          = require('gulp-uglify')
;

gulp.task('concat-html', function() {
    return gulp
        .src([
            // directives
            '../common/js/directives/busy-animation/busy-animation.html',
            '../common/js/directives/component-loading-animation/component-loading-animation.html',
            '../common/js/directives/auth-alert/auth-alert.html',
            '../common/js/directives/community-map/community-map.html',
            '../common/js/directives/map-info-window/map-info-window.html',
            '../common/js/directives/map-list-community/map-list-community.html',
            '../common/js/directives/site-footer/site-footer.html',
            '../common/js/directives/site-header/site-header.html',
            '../common/js/directives/table-list-community/table-list-community.html',
            
            //routables
            '../app/home.html',
            '../app/about.html',
            '../app/care/care.html',
            '../app/communities/communities.html',
            '../app/community/community.html',
            '../app/modals/login/login.html',
            '../app/map/map.html',
            '../app/saved/saved.html',
            '../app/about/about.html',
            
        ])
        .pipe(templateCache({
            filename: 'templates.js',
            module: 'templates',
            standalone: true,
            transformUrl: function(url) {
                // console.log('html template url: ', url);
                var lookup = {
                    // file (what is read by gulp)  // cached filename (what is requested by the web client)
                    "busy-animation.html"               : 'common/js/directives/busy-animation/busy-animation.html',
                    "auth-alert.html"                   : 'common/js/directives/auth-alert/auth-alert.html',
                    "community-map.html"                : 'common/js/directives/community-map/community-map.html',
                    "map-info-window.html"              : 'common/js/directives/map-info-window/map-info-window.html',
                    "map-list-community.html"           : 'common/js/directives/map-list-community/map-list-community.html',
                    "site-footer.html"                  : 'common/js/directives/site-footer/site-footer.html',
                    "site-header.html"                  : 'common/js/directives/site-header/site-header.html',
                    "table-list-community.html"         : 'common/js/directives/table-list-community/table-list-community.html',
                    "component-loading-animation.html"  : 'common/js/directives/component-loading-animation/component-loading-animation.html',
                    "home.html"                         : 'app/home.html',
                    "care.html"                         : 'app/care/care.html',
                    "communities.html"                  : 'app/communities/communities.html',
                    "community.html"                    : 'app/community/community.html',
                    "login.html"                        : 'app/modals/login/login.html',
                    "map.html"                          : 'app/map/map.html',
                    "saved.html"                        : 'app/saved/saved.html',
                    "about.html"                        : 'app/about/about.html',
                    
                };
                
                return lookup[url.trim()];
            }
        }))
        .pipe(gulp.dest('./html/'))
        .on('end', function() { gutil.log('templates.js built!'); })
    ;
});

gulp.task('concat-css-head1', function() {
    return gulp
        .src([
            '../common/bower_components/bootstrap/dist/css/bootstrap.min.css',
            '../common/css/normalize.css',
            '../common/fonts/fontello/css/fontello.css',
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('bundle_head1.css'))
        .pipe(gulp.dest('./css/'))
        .on('end', function() { gutil.log('bundle_head1.css built!'); })
    ;
});
gulp.task('concat-css-head2', function() {
    return gulp
        .src([
            '../common/css/styles.css',
            '../common/css/misc.css',
            '../common/css/animate.css',
            '../common/css/map.css',
            '../common/bower_components/slick-carousel/slick/slick.css',
            '../common/bower_components/slick-carousel/slick/slick-theme.css',
            '../common/bower_components/slick-lightbox/dist/slick-lightbox.css',
            '../common/js/directives/busy-animation/busy-animation.css',
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('bundle_head2.css'))
        .pipe(gulp.dest('./css/'))
        .on('end', function() { gutil.log('bundle_head2.css built!'); })
    ;
});

gulp.task('concat-js-head', function() {
    return gulp
        .src([
            '../common/bower_components/jquery/dist/jquery.min.js',
            '../common/bower_components/slick-carousel/slick/slick.js',
            '../common/bower_components/slick-lightbox/dist/slick-lightbox.js',
            '../common/bower_components/angular/angular.min.js',
        ])
        .pipe(concat('bundle_head.js'))
        .pipe(gulp.dest('./js/'))
        .on('end', function() { gutil.log('bundle_head.js built!'); })
    ;
});

gulp.task('concat-js-body', function() {
    return gulp
        .src([
            
            // vendor code
            '../common/bower_components/angular-touch/angular-touch.min.js',
            '../common/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            '../common/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            '../common/bower_components/angular-messages/angular-messages.min.js',
            '../common/bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
            '../common/bower_components/ng-wrap/ng-wrap.js',
            '../common/bower_components/ng-lodash/build/ng-lodash.min.js',
            '../common/bower_components/angular-sanitize/angular-sanitize.min.js',
            '../common/bower_components/angular-animate/angular-animate.min.js',
            '../common/bower_components/spin.js/spin.min.js',
            '../common/bower_components/angular-spinner/angular-spinner.min.js',
            '../common/bower_components/ngmap/build/scripts/ng-map.min.js',
            '../common/bower_components/angular-slick/dist/slick.js',
            '../common/bower_components/angular-facebook/lib/angular-facebook.js',
            '../common/bower_components/ngMeta/dist/ngMeta.min.js',
            
            // misc
            '../common/js/_misc/scriptBasepath.js',
            '../common/js/_misc/debounce.js',
            '../common/js/directives/my-enter/my-enter.js',
            
            //** app files **//
            
            // services
            "../common/js/services/OmnitureService.js",
            "../common/js/services/HistoryService.js",
            "../common/js/services/RegionsService.js",
            "../common/js/services/CommunitiesService.js",
            "../common/js/services/BrowserDetectionService.js",
            "../common/js/services/MarkersService.js",
            "../common/js/services/DummyDataService.js",
            "../common/js/services/AuthService.js",
            "../common/js/services/FavoritesService.js",
            "../common/js/services/SortService.js",
            "../common/js/services/FilterService.js",
            "../common/js/services/EmailService.js",
            
            // directives
            "../common/js/directives/busy-animation/busy-animation.js",
            "../common/js/directives/auth-alert/auth-alert.js",
            "../common/js/directives/site-header/site-header.js",
            "../common/js/directives/site-footer/site-footer.js",
            "../common/js/directives/community-map/community-map.js",
            "../common/js/directives/map-info-window/map-info-window.js",
            "../common/js/directives/table-list-community/table-list-community.js",
            "../common/js/directives/map-list-community/map-list-community.js",
            "../common/js/directives/component-loading-animation/component-loading-animation.js",
            "../common/js/directives/ng-repeat-finished/ng-repeat-finished.js",

            // routables
            "../app/home.js",
            "../app/map/map.js",
            "../app/communities/communities.js",
            "../app/community/community.js",
            "../app/saved/saved.js",
            "../app/care/care.js",
            "../app/about/about.js",

            // modals
            '../app/modals/login/login.js',
            
            // filters
            '../common/js/filters/telephone.js',
            
            // app
            '../app.js',
            
        ])
        .pipe(concat('bundle_body.js'))
        .pipe(
            uglify({
                mangle: false
            })
        )       
        .pipe(gulp.dest('./js/'))
        .on('end', function() { gutil.log('bundle_body.js built!'); })
    ;
});




gulp.task('default', [
    'concat-html',
    'concat-css-head1',
    'concat-css-head2',
    'concat-js-head',
    'concat-js-body',
    
]);