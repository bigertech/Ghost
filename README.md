# [Ghost](https://github.com/TryGhost/Ghost) [![Build Status](https://travis-ci.org/TryGhost/Ghost.svg?branch=master)](https://travis-ci.org/TryGhost/Ghost)


##  demo

[笔戈科技](http://www.bigertech.com)



博客基于ghost 0.5版本，做了很多优化，加入了新功能。
#### Quickstart:
1. 请先切换到 stable-china 分支，再clone 代码
2. 复制 config.example.js ，命名为 config.js 。
3. 如果你使用mysql 数据库，修改文件config.js  中的development 下的数据库配置信息 ，并且在数据中建立一个utf-8格式的数据库
blog_name

charset 设置为 UTF8_GENERAL_CI 解决中文插入到数据库乱码的问题。

```
database: {
            client: 'mysql',
            connection: {
                host     : '127.0.0.1',
                user     : 'root',
                password : 'root',
                database : 'blog_name',
                charset  : 'UTF8_GENERAL_CI'
            }
        },

```

在控制台，切换到工作目录，执行以下命令

1. `npm install -g grunt-cli`
1. `npm install`
1. `grunt init` (and `grunt prod` if you want to run Ghost in production mode)
1. `npm start`


## 新增改动
*  界面汉化
*  邮件汉化 （未完成）
*  文章类别选择
*  每篇文章加入 文章图片
*  默认文章url为标题的拼音链接， 修改为10000开始的数字
*  文章在界面中的位置指定（为完成）
*  点赞功能（待）
*  多说评论（待）
*  百度统计 根据自己的系统进行配置


## 新增表 post_type
文章的类型，或许你需要插入不同类型的文章比如，日志、科技博客、生活日记等等，然后希望在不同的前端界面展示。
原ghost 使用post.hbs作为模板  

现在新增模板，post-article.hbs、post-video.hbs

### 后台插入文章类别和模板对应关系,你还可以新增post_type

文章类型	| 前端模板
----|-------
文字博客  | post-article.hbs
视频  | post-video.hbs


### 输出某一个类型文章列表 

列表类型	| 前端模板  |           请求方式
----|-------|----------
文字博客  | articles.hbs |          http://domain/t/articles
视频  | videos.hbs      |           http://domain/t/articles


###  每篇文章指定一张图片
在文章内容输出界面，输入 #### ![bg](图片地址)  这种图片会被认为是文章的标志图片
在前端输出 

```
{{image}}   //输出文章图片的地址
<img src="{{image}}" >
```

## Copyright & License
笔戈科技出品

Copyright (c) 2013-2014 Ghost Foundation - Released under the [MIT license](LICENSE).
