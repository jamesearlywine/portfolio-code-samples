<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title', $cruddyData['brandName'])</title>
    <link rel="stylesheet" href="/cruddy/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css" />

    {!! $styles !!}

<!-- environment detection-->
<script src='/cruddy/js/environment.js?v=29'></script>
<script>
    // if we are hosted in production
    if (window.indystar_environment.detect() !== 'dev') {
        // and we are not using https
        if (window.location.protocol != "https:") {
            // redirect to https
            window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
        }
    }
</script>
    
</head>
<body>
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="container-fluid">
            <div class="navbar-header">
                <a href="{!! url(config('cruddy.brand_url', '/')) !!}" target="_blank" class="navbar-brand">
                    {{ $cruddyData['brandName'] }}
                </a>
            </div>

            <div class="navbar-collapse">
                {!! $menu->render(config('cruddy.menu', []), [ 'class' => 'nav navbar-nav' ]) !!}
                {!! $menu->render(config('cruddy.service_menu', []), [ 'class' => 'nav navbar-nav navbar-right']) !!}
            </div>
        </div>
    </nav>

    <div class="main-content" id="content">
        @yield('content')
    </div>

    <script>
        Cruddy = {!! json_encode($cruddyData) !!};
    </script>

    
    <script src='/cruddy/js/vendor.min.js?v=29'></script>
    <script src='/cruddy/js/app.js?v=30'></script>
    
    <!-- this version of bootstrap breaks cruddy drop-down.  
         Leaving it in (but commented out) case we need to extract some parts to support datetimepicker --jle
    <script src='{!! rtrim(str_replace('index.php', '', config('cruddy.uri_prefix')), '/') . '/' !!}cruddy/bower_components/bootstrap/dist/js/bootstrap.min.js?v=29'></script>
    -->
    <script src='/cruddy/bower_components/moment/moment.js?v=29'></script>
    <script src='/cruddy/bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js?v=29'></script>
    <style>
        .form-group.field__datetime {
            position: relative;
        }
    </style>
    
    <!-- {!! $scripts !!} -->
    
    
</body>
</html>