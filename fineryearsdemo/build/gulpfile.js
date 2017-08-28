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
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/busy-animation/busy-animation.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/component-loading-animation/component-loading-animation.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/auth-alert/auth-alert.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/community-map/community-map.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/map-info-window/map-info-window.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/map-list-community/map-list-community.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/site-footer/site-footer.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/site-header/site-header.html',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/table-list-community/table-list-community.html',
            
            //routables
            '../fineryearsdemo.indystardev.com/public/webclient/app/home.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/about.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/care/care.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/communities/communities.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/community/community.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/modals/login/login.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/map/map.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/saved/saved.html',
            '../fineryearsdemo.indystardev.com/public/webclient/app/about/about.html',
            
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
        .pipe(gulp.dest('../fineryearsdemo.indystardev.com/public/webclient/bundle/html/'))
        .on('end', function() { gutil.log('templates.js built!'); })
    ;
});

gulp.task('concat-css-head1', function() {
    return gulp
        .src([
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/bootstrap/dist/css/bootstrap.min.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/normalize.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/responsive.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/fonts/fontello/css/fontello.css'
            
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('bundle_head1.css'))
        .pipe(gulp.dest('../fineryearsdemo.indystardev.com/public/webclient/bundle/css/'))
        .on('end', function() { gutil.log('bundle_head1.css built!'); })
    ;
});
gulp.task('concat-css-head2', function() {
    return gulp
        .src([
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/styles.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/misc.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/animate.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/css/map.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/slick-carousel/slick/slick.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/slick-carousel/slick/slick-theme.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/slick-lightbox/dist/slick-lightbox.css',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/busy-animation/busy-animation.css',
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat('bundle_head2.css'))
        .pipe(gulp.dest('../fineryearsdemo.indystardev.com/public/webclient/bundle/css/'))
        .on('end', function() { gutil.log('bundle_head2.css built!'); })
    ;
});

gulp.task('concat-js-head', function() {
    return gulp
        .src([
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/jquery/dist/jquery.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/slick-carousel/slick/slick.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/slick-lightbox/dist/slick-lightbox.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular/angular.min.js',
        ])
        .pipe(concat('bundle_head.js'))
        .pipe(gulp.dest('../fineryearsdemo.indystardev.com/public/webclient/bundle/js/'))
        .on('end', function() { gutil.log('bundle_head.js built!'); })
    ;
});

gulp.task('concat-js-body', function() {
    return gulp
        .src([
            
            // vendor code
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-touch/angular-touch.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-messages/angular-messages.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/ng-wrap/ng-wrap.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/ng-lodash/build/ng-lodash.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-sanitize/angular-sanitize.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-animate/angular-animate.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/spin.js/spin.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-spinner/angular-spinner.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/ngmap/build/scripts/ng-map.min.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-slick/dist/slick.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/angular-facebook/lib/angular-facebook.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/bower_components/ngMeta/dist/ngMeta.min.js',
            
            // misc
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/_misc/scriptBasepath.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/_misc/debounce.js',
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/my-enter/my-enter.js',
            
            //** app files **//
            
            // services
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/OmnitureService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/HistoryService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/RegionsService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/CommunitiesService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/BrowserDetectionService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/MarkersService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/DummyDataService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/AuthService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/FavoritesService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/SortService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/FilterService.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/services/EmailService.js",
            
            // directives
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/busy-animation/busy-animation.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/auth-alert/auth-alert.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/site-header/site-header.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/site-footer/site-footer.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/community-map/community-map.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/map-info-window/map-info-window.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/table-list-community/table-list-community.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/map-list-community/map-list-community.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/component-loading-animation/component-loading-animation.js",
            "../fineryearsdemo.indystardev.com/public/webclient/common/js/directives/ng-repeat-finished/ng-repeat-finished.js",

            // routables
            "../fineryearsdemo.indystardev.com/public/webclient/app/home.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/map/map.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/communities/communities.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/community/community.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/saved/saved.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/care/care.js",
            "../fineryearsdemo.indystardev.com/public/webclient/app/about/about.js",

            // modals
            '../fineryearsdemo.indystardev.com/public/webclient/app/modals/login/login.js',
            
            // filters
            '../fineryearsdemo.indystardev.com/public/webclient/common/js/filters/telephone.js',
            
            // app
            '../fineryearsdemo.indystardev.com/public/webclient/app.js',
            
        ])
        .pipe(concat('bundle_body.js'))
        .pipe(
            uglify({
                mangle: false
            })
        )       
        .pipe(gulp.dest('../fineryearsdemo.indystardev.com/public/webclient/bundle/js/'))
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