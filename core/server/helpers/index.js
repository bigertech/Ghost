var downsize        = require('downsize'),
    hbs             = require('express-hbs'),
    moment          = require('moment'),
    polyglot        = require('node-polyglot').instance,
    _               = require('lodash'),
    when            = require('when'),
    cheerio         = require('cheerio'),

    api             = require('../api'),
    config          = require('../config'),
    errors          = require('../errors'),
    filters         = require('../filters'),
    template        = require('./template'),
    schema          = require('../data/schema').checks,

    assetTemplate   = _.template('<%= source %>?v=<%= version %>'),
    linkTemplate    = _.template('<a href="<%= url %>"><%= text %></a>'),
    scriptTemplate  = _.template('<script src="<%= source %>?v=<%= version %>"></script>'),
    isProduction    = process.env.NODE_ENV === 'production',

    coreHelpers     = {},
    registerHelpers,

    scriptFiles = {
        production: [
            'vendor.min.js',
            'ghost.min.js',
        ],
        development: [
            'vendor-dev.js',
            'templates-dev.js',
            'ghost-dev.js'
        ]
    },
    //add by liuxing
    typeLinks       = [],
    request         = require('request'),
    youkuUrl        = 'https://openapi.youku.com/v2/videos/show_basic.json';
    deleteTag       = ['youkuid'],
    defaultBgImg = '/content/images/def-bg.jpg';


//初始化所有的 文章类型 和对应的url
api.postType.browse().then(function(result){
    if(result.postTypes){
        _.forEach(result.postTypes,function(item){
            typeLinks.push('/category/'+item.slug);
        });
    }
});

if (!isProduction) {
    hbs.handlebars.logger.level = 0;
}

 // [ description]
 //
 // @param  {Object} context date object
 // @param  {*} options
 // @return {Object} A Moment time / date object
var yearFormat = 'YYYY年M月D日';
var dayFormat = ' MMMD日';
coreHelpers.date = function (context, options) {
    if (!options && context.hasOwnProperty('hash')) {
        options = context;
        context = undefined;

        // set to published_at by default, if it's available
        // otherwise, this will print the current date
        if (this.published_at) {
            context = this.published_at;
        }
    }

    // ensure that context is undefined, not null, as that can cause errors
    context = context === null ? undefined : context;

    var f = options.hash.format || 'MMMDDD',
        timeago = options.hash.timeago,
        date;

    moment.lang("zh-cn");
    if (timeago) {
        var diff = moment().diff(moment(context),'days');
        if(diff < 30){    //30天以内显示  多久之前
            date = moment(context).fromNow();
        }else if( moment().format('YYYY') - moment(context).format('YYYY') < 1 ){   //一年内 显示 几月几号
            date = moment(context).format(dayFormat);
        }else{
            date = moment(context).format(yearFormat);
        }
    } else {
        date = moment(context).format(f);
    }
    moment.lang("en");
    return date;
};

//
// ### URI Encoding helper
//
// *Usage example:*
// `{{encode uri}}`
//
// Returns URI encoded string
//
coreHelpers.encode = function (context, str) {
    var uri = context || str;
    return new hbs.handlebars.SafeString(encodeURIComponent(uri));
};

// ### Page URL Helper
//
// *Usage example:*
// `{{page_url 2}}`
//
// Returns the URL for the page specified in the current object
// context.
//
coreHelpers.page_url = function (context, block) {
    /*jshint unused:false*/
    var url = config.paths.subdir;

    if (this.tagSlug !== undefined) {
        url += '/tag/' + this.tagSlug;
    }

    if (this.authorSlug !== undefined) {
        url += '/author/' + this.authorSlug;
    }
    // add by liuxing
    //author  作者列表 http://127.0.0.1:2368/author/bigertech/page/2/
    //tag http://127.0.0.1:2368/tag/bi-ge-ke-ji/page/2/
    if(_.indexOf(typeLinks,block) != -1){
        url += block;    //类型列表
    }
    url += '/page/'+context;    //主页列表


    return url;
};

// ### Page URL Helper: DEPRECATED
//
// *Usage example:*
// `{{pageUrl 2}}`
//
// Returns the URL for the page specified in the current object
// context. This helper is deprecated and will be removed in future versions.
//
coreHelpers.pageUrl = function (context, block) {
    errors.logWarn('Warning: pageUrl is deprecated, please use page_url instead\n' +
                    'The helper pageUrl has been replaced with page_url in Ghost 0.4.2, and will be removed entirely in Ghost 0.6\n' +
                    'In your theme\'s pagination.hbs file, pageUrl should be renamed to page_url');

    /*jshint unused:false*/
    var self = this;

    return coreHelpers.page_url.call(self, context, block);
};

// ### URL helper
//
// *Usage example:*
// `{{url}}`
// `{{url absolute="true"}}`
//
// Returns the URL for the current object context
// i.e. If inside a post context will return post permalink
// absolute flag outputs absolute URL, else URL is relative
coreHelpers.url = function (options) {
    var absolute = options && options.hash.absolute;

    if (schema.isPost(this)) {
        return config.urlForPost(api.settings, this, absolute);
    }

    if (schema.isTag(this)) {
        return when(config.urlFor('tag', {tag: this}, absolute));
    }

    if (schema.isUser(this)) {
        return when(config.urlFor('author', {author: this}, absolute));
    }


    return when(config.urlFor(this, absolute));
};

// ### Asset helper
//
// *Usage example:*
// `{{asset "css/screen.css"}}`
// `{{asset "css/screen.css" ghost="true"}}`
// Returns the path to the specified asset. The ghost
// flag outputs the asset path for the Ghost admin
coreHelpers.asset = function (context, options) {
    var output = '',
        isAdmin = options && options.hash && options.hash.ghost;

    output += config.paths.subdir + '/';

    if (!context.match(/^favicon\.ico$/) && !context.match(/^shared/) && !context.match(/^asset/)) {
        if (isAdmin) {
            output += 'ghost/';
        } else if (config.cdn.isProduction) {
            output = config.cdn.staticAssetsUrl;
        } else {
            output += 'assets/';
        }
    }

    // Get rid of any leading slash on the context
    context = context.replace(/^\//, '');
    output += context;

    if (!context.match(/^favicon\.ico$/)) {
        output = assetTemplate({
            source: output,
            version: coreHelpers.assetHash
        });
    }

    return new hbs.handlebars.SafeString(output);
};

// ### Author Helper
//
// *Usage example:*
// `{{author}}`
//
// Returns the full name of the author of a given post, or a blank string
// if the author could not be determined.
//
coreHelpers.author = function (context, options) {
    if (_.isUndefined(options)) {
        options = context;
    }

    if (options.fn) {
        return hbs.handlebars.helpers['with'].call(this, this.author, options);
    }

    var autolink = _.isString(options.hash.autolink) && options.hash.autolink === 'false' ? false : true,
        output = '';

    if (this.author && this.author.name) {
        if (autolink) {
            output = linkTemplate({
                url: config.urlFor('author', {author: this.author}),
                text: _.escape(this.author.name)
            });
        } else {
            output = _.escape(this.author.name);
        }
    }

    return new hbs.handlebars.SafeString(output);
};

// ### Tags Helper
//
// *Usage example:*
// `{{tags}}`
// `{{tags separator=' - '}}`
//
// Returns a string of the tags on the post.
// By default, tags are separated by commas.
//
// Note that the standard {{#each tags}} implementation is unaffected by this helper
// and can be used for more complex templates.
coreHelpers.tags = function (options) {
    options = options || {};
    options.hash = options.hash || {};

    var autolink = options.hash && _.isString(options.hash.autolink) && options.hash.autolink === 'false' ? false : true,
        separator = options.hash && _.isString(options.hash.separator) ? options.hash.separator : ', ',
        prefix = options.hash && _.isString(options.hash.prefix) ? options.hash.prefix : '',
        suffix = options.hash && _.isString(options.hash.suffix) ? options.hash.suffix : '',
        output = '';

    function createTagList(tags) {
        var tagNames = _.pluck(tags, 'name');

        if (autolink) {
            return _.map(tags, function (tag) {
                return linkTemplate({
                    url: config.urlFor('tag', {tag: tag}),
                    text: _.escape(tag.name)
                });
            }).join(separator);
        }
        return _.escape(tagNames.join(separator));
    }

    if (this.tags && this.tags.length) {
        output = prefix + createTagList(this.tags) + suffix;
    }

    return new hbs.handlebars.SafeString(output);
};
//add by liuxing 修改格式
function addblank(inText)
{
    return inText.replace(/([\u4E00-\u9FA3])([A-Za-z0-9\(\[\{@#])/g,'$1 $2')
        .replace(/([A-Za-z0-9\.,!@#%?\)\]\}])([\u4E00-\u9FA3])/g,'$1 $2')
        .replace(/([〔〕（）。，！？《》—“”「」]) +/g,'$1')
        .replace(/ +([〔〕（）。，！？《》—“”「」])/g,'$1')
        .replace(/ +/g,' ')
        .replace(/“/g,"「")
        .replace(/”/g,"」")
        .replace(/‘/g,"『")
        .replace(/’/g,"』");
}
//end add
// ### Content Helper
//
// *Usage example:*
// `{{content}}`
// `{{content words="20"}}`
// `{{content characters="256"}}`
//
// Turns content html into a safestring so that the user doesn't have to
// escape it or tell handlebars to leave it alone with a triple-brace.
//
// Enables tag-safe truncation of content by characters or words.
//
// **returns** SafeString content html, complete or truncated.
//
coreHelpers.content = function (options) {
    var truncateOptions = (options || {}).hash || {};
    truncateOptions = _.pick(truncateOptions, ['words', 'characters']);
    _.keys(truncateOptions).map(function (key) {
        truncateOptions[key] = parseInt(truncateOptions[key], 10);
    });

    if (truncateOptions.hasOwnProperty('words') || truncateOptions.hasOwnProperty('characters')) {
        // Due to weirdness in downsize the 'words' option
        // must be passed as a string. refer to #1796
        // TODO: when downsize fixes this quirk remove this hack.
        if (truncateOptions.hasOwnProperty('words')) {
            truncateOptions.words = truncateOptions.words.toString();
        }
        return new hbs.handlebars.SafeString(
            downsize(this.html, truncateOptions)
        );
    }
    //正文图片延迟加载
    var $ = cheerio.load(this.html);
    var imgs = $("img");
    imgs.each(function(i,e){
        $(e).addClass("lazy");
        var src = $(this).attr('src');
        if(config.cdn.isProduction && src.indexOf(config.paths.contentPath)){
            $(this).attr('data-original', getCdnImageUrl(src));
        } else{
            $(e).attr("data-original",$(e).attr("src"));
        }
        $(e).removeAttr("src");
    });
    this.html = addblank($.html());  //加空格和 「」

    return new hbs.handlebars.SafeString(this.html);
};

//add by liuxing add helper
coreHelpers.title = function () {
    return  new hbs.handlebars.SafeString(hbs.handlebars.Utils.escapeExpression(this.title || ''));
};
coreHelpers.uuid = function () {
    return  new hbs.handlebars.SafeString(this.uuid);
};
coreHelpers.slug = function () {
    return  new hbs.handlebars.SafeString(this.slug);
};
coreHelpers.type_class = function () {
    return  new hbs.handlebars.SafeString('type-'+this.post_type.slug);
};

/*
* 多说数据模板
* duoshuo:
 { thread_id: '1249821464362746038',
 channel_key: null,
 thread_key: '53b2e44a-1c29-4048-867c-80919c3c247b',
 comments: 4,
 reposts: 0,
 likes: 0,
 weibo_reposts: 1,
 qqt_reposts: 0 } }

 获取到点赞数量
* */
coreHelpers.post_star = function () {
    var star = this.duoshuo ? this.duoshuo.likes:0;
    return  new hbs.handlebars.SafeString(star);
};
//输出文章的简介
coreHelpers.post_desc = function () {
    var desc = this.meta_description ? this.meta_description : '';
    return  new hbs.handlebars.SafeString(desc);
};
coreHelpers.duoshuo_block = function () {
    var context = {
        title : this.title,
        uuid : this.uuid,
        duoshuo_url : config.url+'/'+ this.slug
    };
    return template.execute('duoshuo', context);
};

function getProductImage(img){
    if (config.cdn.isProduction) {
        img = getCdnImageUrl(img);
    }
    return  new hbs.handlebars.SafeString(img);
}

var coverImg = '/content/images/def-author.jpg';
coreHelpers.author_cover = function(){
    if(this.cover){
        coverImg = this.cover;
    }
   return getProductImage(coverImg);
}

/*
* 响应数据
* { id: 'XNzI1NDU4ODI0',
 title: '2004年习近平主席专访：我是延安人[@新全民开讲]',
 link: 'http://v.youku.com/v_show/id_XNzI1NDU4ODI0.html',
 thumbnail: 'http://g4.ykimg.com/0100641F4653999B6EA8E704006A33D013864B-A787-0A64-FF2F-11F85065B398',
 bigThumbnail: 'http://g4.ykimg.com/1100641F4653999B6EA8E704006A33D013864B-A787-0A64-FF2F-11F85065B398',
 duration: '1677.13',
 category: '资讯',
 state: 'normal',
 created: '2014-06-12 20:04:33',
 published: '2014-06-12 20:59:33',
 description: '2004年习近平主席专访：我是延安人[@新全民开讲]',
 player: 'http://player.youku.com/player.php/sid/XNzI1NDU4ODI0/v.swf',
 public_type: 'all',
 copyright_type: 'reproduced',
 user:
 { id: '67136051',
 name: '新全民开讲',
 link: 'http://v.youku.com/user_show/id_UMjY4NTQ0MjA0html' },
 tags: '2004年,习近平主席,专访,我是延安人,新全民开讲',
 view_count: 3110970,
 favorite_count: '19',
 comment_count: '4790',
 up_count: '34353',
 down_count: '1012',
 operation_limit: [],
 streamtypes: [ 'flvhd', '3gphd' ],
 source:
 { id: '10020',
 name: '优酷PC客户端',
 link: 'http://c.youku.com/pc-client' } }

 * */
coreHelpers.video_play_count = function () {
    var defer   = when.defer(),
        $       = cheerio.load(this.html),
        video_id;

    video_id = $("youkuid").text();
    var data = {
            url: youkuUrl,
            qs: {
                client_id: '2cf898d1c36ea115',
                video_id : video_id,
                ext: 'view_count,up_count'
            }
    };

    if(video_id && video_id !==  ''){
         request(data,function(err,data){
            if(err){
                console.error(err);
            }
            var youku = JSON.parse(data.body);
            var view_count = youku.view_count ? youku.view_count : 0;  //播放次数
            defer.resolve(new hbs.handlebars.SafeString(view_count));
        });
    }else{
        defer.resolve(new hbs.handlebars.SafeString(0));
    }

    return defer.promise;
};
coreHelpers.post_relative = function (options) {
    var option = (options || {}).hash || {};
    var data = {
        title : this.title,
        post_type  : this.post_type,
        limit : parseInt(option.limit)+1

    };
    return api.posts.findRelate(data).then(function(posts){
        return template.execute('relative_post', posts);
    });

};

coreHelpers.index_topic = function (options) {
    var option = (options || {}).hash || {};
    // 得到指定slug专题下的所有文章
    return api.positions.getRelationsByPositionSlug(option.data, {publish: 1 }).then(function(relation) {
        if (!relation) {
            //return when.reject(new errors.NotFoundError('Topic not be found.'));
        }
        var data = {};
        if(relation && relation[0]){
            relation[0].siteUrl = relation[0].url;
            data = relation[0];
        }
        return template.execute('topic', {topic:data});
    })
};

//end add

// --- Modified by happen
// --- If current runing env is production, load the image from cdn.
coreHelpers.image = function () {
    if(!this.image){
        this.image = defaultBgImg;
    }
    return getProductImage(this.image);
};

coreHelpers.image_sm = function() {
    if (!this.image) {
        this.image = defaultBgImg;
    }
    // 得到裁剪过后的图片
    if (config.images.dir) {
        var image_url = this.image;
        var last_slug = image_url.lastIndexOf('\/');
        this.image = image_url.substr(0,last_slug)+'/'+config.images.dir+image_url.substr(last_slug,image_url.length);
    }
    return getProductImage(this.image);
};

function getCdnImageUrl(image) {
    var pos = image.indexOf('images/');
    if (pos !== -1) {
        var imgPath = image.substr(pos + 'images/'.length);
        image = config.cdn.dynamicAssetsUrl;
        if (config.cdn.dynamicAssetsUrl && config.cdn.dynamicAssetsUrl.substr(-1) !== '/') {
            image += '/';
        }

        image += imgPath;
    }

    return image;
}
// --- end

//end add
// ### Excerpt Helper
//
// *Usage example:*
// `{{excerpt}}`
// `{{excerpt words="50"}}`
// `{{excerpt characters="256"}}`
//
// Attempts to remove all HTML from the string, and then shortens the result according to the provided option.
//
// Defaults to words="50"
//
// **returns** SafeString truncated, HTML-free content.
//
coreHelpers.excerpt = function (options) {
    var truncateOptions = (options || {}).hash || {},
        excerpt;
    //如果是视频  则删除屌  youkuid 标签
    if(this.isVideo){
        var $ = cheerio.load(this.html);
        $(deleteTag[0]).remove();
        this.html = $.html();
    }

    truncateOptions = _.pick(truncateOptions, ['words', 'characters']);
    _.keys(truncateOptions).map(function (key) {
        truncateOptions[key] = parseInt(truncateOptions[key], 10);
    });
    /*jslint regexp:true */
    excerpt = String(this.html).replace(/<\/?[^>]+>/gi, '');
    excerpt = excerpt.replace(/(\r\n|\n|\r)+/gm, ' ');
    /*jslint regexp:false */

    if (!truncateOptions.words && !truncateOptions.characters) {
        truncateOptions.words = 50;
    }

    return new hbs.handlebars.SafeString(
        downsize(excerpt, truncateOptions)
    );
};

// ### Filestorage helper
//
// *Usage example:*
// `{{file_storage}}`
//
// Returns the config value for fileStorage.
coreHelpers.file_storage = function (context, options) {
    /*jshint unused:false*/
    if (config.hasOwnProperty('fileStorage')) {
        return _.isObject(config.fileStorage) ? 'true' : config.fileStorage.toString();
    }
    return 'true';
};

// ### Apps helper
//
// *Usage example:*
// `{{apps}}`
//
// Returns the config value for apps.
coreHelpers.apps = function (context, options) {
    /*jshint unused:false*/
    if (config.hasOwnProperty('apps')) {
        return config.apps.toString();
    }
    return 'false';
};

// ### Blog Url helper
//
// *Usage example:*
// `{{blog_url}}`
//
// Returns the config value for url.
coreHelpers.blog_url = function (context, options) {
    /*jshint unused:false*/
    return config.theme().url.toString();
};

coreHelpers.ghost_script_tags = function () {
    var scriptList = isProduction ? scriptFiles.production : scriptFiles.development;

    scriptList = _.map(scriptList, function (fileName) {
        return scriptTemplate({
            source: config.paths.subdir + '/ghost/scripts/' + fileName,
            version: coreHelpers.assetHash
        });
    });

    return scriptList.join('');
};

/*
 * Asynchronous Theme Helpers (Registered with registerAsyncThemeHelper)
 */

coreHelpers.body_class = function (options) {
    /*jshint unused:false*/
    var classes = [],
        post = this.post,
        tags = this.post && this.post.tags ? this.post.tags : this.tags || [],
        page = this.post && this.post.page ? this.post.page : this.page || false;

    if (_.isString(this.relativeUrl) && this.relativeUrl.match(/\/(page\/\d)/)) {
        classes.push('archive-template');
    } else if (!this.relativeUrl || this.relativeUrl === '/' || this.relativeUrl === '') {
        classes.push('home-template');
    } else if (post) {
        classes.push('post-template');
    }
    //add by liuxing
    if( this.relativeUrl.match(/^.*(category).*$/)){
        classes.push('category-template');
    }
    //end by liuxing

    if (this.tag !== undefined) {
        classes.push('tag-template');
        classes.push('tag-' + this.tag.slug);
    }

    if (this.author !== undefined) {
        classes.push('author-template');
        classes.push('author-' + this.author.slug);
    }

    if (tags) {
        classes = classes.concat(tags.map(function (tag) { return 'tag-' + tag.slug; }));
    }

    if (page) {
        classes.push('page');
    }

    return api.settings.read({context: {internal: true}, key: 'activeTheme'}).then(function (response) {
        var activeTheme = response.settings[0],
            paths = config.paths.availableThemes[activeTheme.value],
            view;

        if (post) {
            view = template.getThemeViewForPost(paths, post).split('-');

            // If this is a page and we have a custom page template
            // then we need to modify the class name we inject
            // e.g. 'page-contact' is outputted as 'page-template-contact'
            if (view[0] === 'page' && view.length > 1) {
                view.splice(1, 0, 'template');
                classes.push(view.join('-'));
            }
        }

        return filters.doFilter('body_class', classes).then(function (classes) {
            var classString = _.reduce(classes, function (memo, item) { return memo + ' ' + item; }, '');
            return new hbs.handlebars.SafeString(classString.trim());
        });
    });
};

coreHelpers.post_class = function (options) {
    /*jshint unused:false*/
    var classes = ['post'],
        tags = this.post && this.post.tags ? this.post.tags : this.tags || [],
        featured = this.post && this.post.featured ? this.post.featured : this.featured || false,
        page = this.post && this.post.page ? this.post.page : this.page || false;

    if (tags) {
        classes = classes.concat(tags.map(function (tag) { return 'tag-' + tag.slug; }));
    }

    if (featured) {
        classes.push('featured');
    }

    if (page) {
        classes.push('page');
    }

    return filters.doFilter('post_class', classes).then(function (classes) {
        var classString = _.reduce(classes, function (memo, item) { return memo + ' ' + item; }, '');
        return new hbs.handlebars.SafeString(classString.trim());
    });
};

coreHelpers.ghost_head = function (options) {
    /*jshint unused:false*/
    var self = this,
        blog = config.theme(),
        head = [],
        majorMinor = /^(\d+\.)?(\d+)/,
        trimmedVersion = this.version;

    trimmedVersion = trimmedVersion ? trimmedVersion.match(majorMinor)[0] : '?';

    head.push('<meta name="generator" content="Ghost ' + trimmedVersion + '" />');

    head.push('<link rel="alternate" type="application/rss+xml" title="' +
        _.escape(blog.title)  + '" href="' + config.urlFor('rss') + '">');

    return coreHelpers.url.call(self, {hash: {absolute: true}}).then(function (url) {
        head.push('<link rel="canonical" href="' + url + '" />');

        return filters.doFilter('ghost_head', head);
    }).then(function (head) {
        var headString = _.reduce(head, function (memo, item) { return memo + '\n' + item; }, '');
        return new hbs.handlebars.SafeString(headString.trim());
    });
};

coreHelpers.ghost_foot = function (options) {
    /*jshint unused:false*/
    var jquery = isProduction ? 'jquery.min.js' : 'jquery.js',
        foot = [];

    foot.push(scriptTemplate({
        source: config.paths.subdir + '/public/' + jquery,
        version: coreHelpers.assetHash
    }));

    return filters.doFilter('ghost_foot', foot).then(function (foot) {
        var footString = _.reduce(foot, function (memo, item) { return memo + ' ' + item; }, '');
        return new hbs.handlebars.SafeString(footString.trim());
    });
};

coreHelpers.meta_title = function (options) {
    /*jshint unused:false*/
    var title = '',
        blog;

    if (_.isString(this.relativeUrl)) {
        blog = config.theme();
        if (!this.relativeUrl || this.relativeUrl === '/' || this.relativeUrl === '' || this.relativeUrl.match(/\/page/)) {
            title = blog.title;
        } else if (this.post) {
            title = this.post.title;
        } else if (this.tag) {
            title = this.tag.name + ' - ' + blog.title;
        } else if (this.author) {
            title = this.author.name + ' - ' + blog.title;
        }
    }

    return filters.doFilter('meta_title', title).then(function (title) {
        title = title || '';
        return title.trim();
    });
};

coreHelpers.meta_description = function (options) {
    /*jshint unused:false*/
    var description,
        blog;

    if (_.isString(this.relativeUrl)) {
        if (!this.relativeUrl || this.relativeUrl === '/' || this.relativeUrl === '' || this.relativeUrl.match(/\/page/)) {
            blog = config.theme();
            description = blog.description;
        } else {
            description = '';
        }
    }
    return filters.doFilter('meta_description', description).then(function (description) {
        description = description || '';
        return description.trim();
    });
};

/**
 * Localised string helpers
 *
 * @param {String} key
 * @param {String} default translation
 * @param {Object} options
 * @return {String} A correctly internationalised string
 */
coreHelpers.e = function (key, defaultString, options) {
    var output;
    return when.all([
        api.settings.read('defaultLang'),
        api.settings.read('forceI18n')
    ]).then(function (values) {
        if (values[0].settings[0] === 'en_US' &&
                _.isEmpty(options.hash) &&
                values[1].settings[0] !== 'true') {
            output = defaultString;
        } else {
            output = polyglot.t(key, options.hash);
        }

        return output;
    });
};

coreHelpers.foreach = function (context, options) {
    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        j = 0,
        columns = options.hash.columns,
        key,
        ret = '',
        data;

    if (options.data) {
        data = hbs.handlebars.createFrame(options.data);
    }

    function setKeys(_data, _i, _j, _columns) {
        if (_i === 0) {
            _data.first = true;
        }
        if (_i === _j - 1) {
            _data.last = true;
        }
        // first post is index zero but still needs to be odd
        if (_i % 2 === 1) {
            _data.even = true;
        } else {
            _data.odd = true;
        }
        if (_i % _columns === 0) {
            _data.rowStart = true;
        } else if (_i % _columns === (_columns - 1)) {
            _data.rowEnd = true;
        }
        return _data;
    }
    if (context && typeof context === 'object') {
        if (context instanceof Array) {
            for (j = context.length; i < j; i += 1) {
                if (data) {
                    data.index = i;
                    data.first = data.rowEnd = data.rowStart = data.last = data.even = data.odd = false;
                    data = setKeys(data, i, j, columns);
                }
                ret = ret + fn(context[i], { data: data });
            }
        } else {
            for (key in context) {
                if (context.hasOwnProperty(key)) {
                    j += 1;
                }
            }
            for (key in context) {
                if (context.hasOwnProperty(key)) {
                    if (data) {
                        data.key = key;
                        data.first = data.rowEnd = data.rowStart = data.last = data.even = data.odd = false;
                        data = setKeys(data, i, j, columns);
                    }
                    ret = ret + fn(context[key], {data: data});
                    i += 1;
                }
            }
        }
    }

    if (i === 0) {
        ret = inverse(this);
    }

    return ret;
};

// ### Has Helper
// `{{#has tag="video, music"}}`
// `{{#has author="sam, pat"}}`
// Checks whether a post has at least one of the tags
coreHelpers.has = function (options) {
    options = options || {};
    options.hash = options.hash || {};

    var tags = _.pluck(this.tags, 'name'),
        author = this.author ? this.author.name : null,
        tagList = options.hash.tag || false,
        authorList = options.hash.author || false,
        tagsOk,
        authorOk;

    function evaluateTagList(expr, tags) {
        return expr.split(',').map(function (v) {
            return v.trim();
        }).reduce(function (p, c) {
            return p || (_.findIndex(tags, function (item) {
                // Escape regex special characters
                item = item.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
                item = new RegExp(item, 'i');
                return item.test(c);
            }) !== -1);
        }, false);
    }

    function evaluateAuthorList(expr, author) {
        var authorList =  expr.split(',').map(function (v) {
            return v.trim().toLocaleLowerCase();
        });

        return _.contains(authorList, author.toLocaleLowerCase());
    }

    if (!tagList && !authorList) {
        errors.logWarn('Invalid or no attribute given to has helper');
        return;
    }

    tagsOk = tagList && evaluateTagList(tagList, tags) || false;
    authorOk = authorList && evaluateAuthorList(authorList, author) || false;

    if (tagsOk || authorOk) {
        return options.fn(this);
    }
    return options.inverse(this);
};

// ### Pagination Helper
// `{{pagination}}`
// Outputs previous and next buttons, along with info about the current page
coreHelpers.pagination = function (options) {
    /*jshint unused:false*/
    if (!_.isObject(this.pagination) || _.isFunction(this.pagination)) {
        return errors.logAndThrowError('pagination data is not an object or is a function');
    }

    if (_.isUndefined(this.pagination.page) || _.isUndefined(this.pagination.pages) ||
            _.isUndefined(this.pagination.total) || _.isUndefined(this.pagination.limit)) {
        return errors.logAndThrowError('All values must be defined for page, pages, limit and total');
    }

    if ((!_.isNull(this.pagination.next) && !_.isNumber(this.pagination.next)) ||
            (!_.isNull(this.pagination.prev) && !_.isNumber(this.pagination.prev))) {
        return errors.logAndThrowError('Invalid value, Next/Prev must be a number');
    }

    if (!_.isNumber(this.pagination.page) || !_.isNumber(this.pagination.pages) ||
            !_.isNumber(this.pagination.total) || !_.isNumber(this.pagination.limit)) {
        return errors.logAndThrowError('Invalid value, check page, pages, limit and total are numbers');
    }
    var slug = '/category/'+this.posts[0].post_type.slug;
    /* 显示页数 liuxing */
    if(options.hash.type == 'page'){  //不是默认主页（各种类型混合），则使用文章的类型（文章、视频、等等）
        slug = '';
    }

    if (this.tag !== undefined) {   //tag 分页
        slug = '/tag/' + this.tag.slug;
    }
    if (this.author !== undefined) {  //作者信息分页
        slug = '/author/' + this.author.slug;
    }

    this.pagination.post_type = slug;
    var pagesItem =  '';
    var result = getPagination(this.pagination.pages,this.pagination.page);
    for(var i = 0 ;i < result.length;i++){
        //省略号
        if(result[i] == '...'){
            pagesItem += "<span class='page omit'>"+result[i]+"</span>";
            continue;
        }
        if(result[i] == this.pagination.page){
            pagesItem +=  "<span class='page current'>"+result[i]+"</span>";
        }else{
            pagesItem += "<a href="+ slug +"/page/"+ result[i] +" class='page-num'><span class='page'>"+result[i]+"</span></a>";
        }
    }

    this.pagination.pageArray = pagesItem;
    /*end  显示页数 */
    var context = _.merge({}, this.pagination);

    if (this.tag !== undefined) {
        context.tagSlug = this.tag.slug;
    }

    if (this.author !== undefined) {
        context.authorSlug = this.author.slug;
    }

    return template.execute('pagination', context);
};
function getPagination(pageNum,current){
    if(pageNum < current)
        return 'error';

    var pageArray = [];
    //小于 5 页
    if(pageNum <= 5){
        for(var i = 1;i <= pageNum ;i++){
            pageArray.push(i);
        }
        return pageArray;
    }
    //大于5页
    //当前页小3

    if(current <= 3){
        for(var i = 1;i <= 5 ;i++){
            pageArray.push(i);
        }
        pageArray.push('...');
        pageArray.push(pageNum); //尾页
        return pageArray;
    }
    pageArray.push(1);      //首页
    //当前页大于 pageNum-3      ... ,3 ,4 ,5 ,6, 7
    if( current >= pageNum-3 ){
        pageArray.push('...');
        for(var i = pageNum-4;i <= pageNum ;i++){
            pageArray.push(i);
        }
        return pageArray;
    }
    if(current  > 4){
        pageArray.push('...');
    }
    //其他情况

    pageArray.push(current - 2);
    pageArray.push(current - 1);
    pageArray.push(current );
    pageArray.push(current + 1);
    pageArray.push(current + 2);
    if(current  < pageNum-1 ){
        pageArray.push('...');
    }
    pageArray.push(pageNum); //尾页

    return pageArray;
}
// ## Pluralize strings depending on item count
// {{plural 0 empty='No posts' singular='% post' plural='% posts'}}
// The 1st argument is the numeric variable which the helper operates on
// The 2nd argument is the string that will be output if the variable's value is 0
// The 3rd argument is the string that will be output if the variable's value is 1
// The 4th argument is the string that will be output if the variable's value is 2+
// coreHelpers.plural = function (number, empty, singular, plural) {
coreHelpers.plural = function (context, options) {
    if (_.isUndefined(options.hash) || _.isUndefined(options.hash.empty) ||
        _.isUndefined(options.hash.singular) || _.isUndefined(options.hash.plural)) {
        return errors.logAndThrowError('All values must be defined for empty, singular and plural');
    }

    if (context === 0) {
        return new hbs.handlebars.SafeString(options.hash.empty);
    } else if (context === 1) {
        return new hbs.handlebars.SafeString(options.hash.singular.replace("%", context));
    } else if (context >= 2) {
        return new hbs.handlebars.SafeString(options.hash.plural.replace("%", context));
    }
};

coreHelpers.helperMissing = function (arg) {
    if (arguments.length === 2) {
        return undefined;
    }
    errors.logError('Missing helper: "' + arg + '"');
};

// ## Admin URL helper
// uses urlFor to generate a URL for either the admin or the frontend.
coreHelpers.admin_url = function (options) {
    var absolute = options && options.hash && options.hash.absolute,
        // Ghost isn't a named route as currently it violates the must start-and-end with slash rule
        context = !options || !options.hash || !options.hash.frontend ? {relativeUrl: '/ghost'} : 'home';

    return config.urlFor(context, absolute);
};

// Register an async handlebars helper for a given handlebars instance
function registerAsyncHelper(hbs, name, fn) {
    hbs.registerAsyncHelper(name, function (options, cb) {
        // Wrap the function passed in with a when.resolve so it can
        // return either a promise or a value
        when.resolve(fn.call(this, options)).then(function (result) {
            cb(result);
        }).otherwise(function (err) {
            errors.logAndThrowError(err, 'registerAsyncThemeHelper: ' + name);
        });
    });
}

// Register a handlebars helper for themes
function registerThemeHelper(name, fn) {
    hbs.registerHelper(name, fn);
}

// Register an async handlebars helper for themes
function registerAsyncThemeHelper(name, fn) {
    registerAsyncHelper(hbs, name, fn);
}

// Register a handlebars helper for admin
function registerAdminHelper(name, fn) {
    coreHelpers.adminHbs.registerHelper(name, fn);
}



registerHelpers = function (adminHbs, assetHash) {

    // Expose hbs instance for admin
    coreHelpers.adminHbs = adminHbs;

    // Store hash for assets
    coreHelpers.assetHash = assetHash;


    // Register theme helpers
    registerThemeHelper('asset', coreHelpers.asset);

    registerThemeHelper('author', coreHelpers.author);

    registerThemeHelper('content', coreHelpers.content);

    registerThemeHelper('title', coreHelpers.title);

    registerThemeHelper('date', coreHelpers.date);

    registerThemeHelper('encode', coreHelpers.encode);

    registerThemeHelper('excerpt', coreHelpers.excerpt);

    registerThemeHelper('foreach', coreHelpers.foreach);

    registerThemeHelper('has', coreHelpers.has);

    registerThemeHelper('page_url', coreHelpers.page_url);

    registerThemeHelper('pageUrl', coreHelpers.pageUrl);

    registerThemeHelper('pagination', coreHelpers.pagination);

    registerThemeHelper('tags', coreHelpers.tags);

    registerThemeHelper('plural', coreHelpers.plural);

    registerAsyncThemeHelper('body_class', coreHelpers.body_class);

    registerAsyncThemeHelper('e', coreHelpers.e);

    registerAsyncThemeHelper('ghost_foot', coreHelpers.ghost_foot);

    registerAsyncThemeHelper('ghost_head', coreHelpers.ghost_head);

    registerAsyncThemeHelper('meta_description', coreHelpers.meta_description);

    registerAsyncThemeHelper('meta_title', coreHelpers.meta_title);

    registerAsyncThemeHelper('post_class', coreHelpers.post_class);

    //add by liuxing

    registerAsyncThemeHelper('url', coreHelpers.url);
    registerAsyncThemeHelper('video_play_count', coreHelpers.video_play_count);
    registerAsyncThemeHelper('post_relative', coreHelpers.post_relative);
    registerAsyncThemeHelper('index_topic', coreHelpers.index_topic);

    registerThemeHelper('uuid', coreHelpers.uuid);
    registerThemeHelper('slug', coreHelpers.slug);
    registerThemeHelper('image', coreHelpers.image);
    registerThemeHelper('image_sm', coreHelpers.image_sm);
    registerThemeHelper('type_class', coreHelpers.type_class);
    registerThemeHelper('post_star', coreHelpers.post_star);
    registerThemeHelper('post_desc', coreHelpers.post_desc);
    registerThemeHelper('duoshuo_block', coreHelpers.duoshuo_block);
    registerThemeHelper('author_cover', coreHelpers.author_cover);


    //end add

    // Register admin helpers
    registerAdminHelper('ghost_script_tags', coreHelpers.ghost_script_tags);

    registerAdminHelper('asset', coreHelpers.asset);

    registerAdminHelper('apps', coreHelpers.apps);

    registerAdminHelper('file_storage', coreHelpers.file_storage);

    registerAdminHelper('blog_url', coreHelpers.blog_url);
};

module.exports = coreHelpers;
module.exports.loadCoreHelpers = registerHelpers;
module.exports.registerThemeHelper = registerThemeHelper;
module.exports.registerAsyncThemeHelper = registerAsyncThemeHelper;
module.exports.scriptFiles = scriptFiles;
