---
layout: post
title: "快速搭建Github Page个人博客"
date: 2015-08-20 14:53:32 +0000
comments: true
categories: Technic
tags: [Blog, Cloud9, Github, Octopress]
---

继“Hello World”后，整理下搭建本Blog的过程，顺便练练手。网上已经有很多相关的教程，
所以很多地方不再赘述，以引用和个人碰到的问题为主。


本博客使用到的工具有Cloud9 (云端编写环境），Github（云端服务器）以及Octopress模板。
由于以下所有的工具和命令都可以在游览器上完成，所以理论上在任何一台电脑上都可以完成搭建任务。
为什么要选择Github Page的文章很多，比如[这里](http://www.jtianling.com/write-blog-with-jekyll-and-github-page.html)。

-----
### 1. Ruby环境
由于Octopress基于Jekyll，所以需要本地安装Ruby。安装Ruby RVM环境或许会让人感觉困扰，尤其是windows用户。即使是linux用户，如果source.list里面有任何地址导致`apt-get update` 命令出现error，
`gem` 和 `bundle install` 命令也会拒绝安装。这就是云平台的优势了。

创建Cloud9的账户，然后新建一个workspace, template 设为 "Ruby on Rails Tutorial"。于是所有本地需要的tools都已装好。
接下来在你Cloud9的workspace中打开 Terminal 开始输命令，来自 [这里](http://qjpcpu.github.io/blog/2014/08/31/shi-yong-octopressda-jian-github-pages/):

    git clone git://github.com/imathis/octopress.git octopress
    cd octopress
    bundle install
    rake install

### 2. Octopress+Github
Octopress已经可以了。这时需要在Github里新建一个名为`username.github.io`的空Repo，请设置为public。
然后回到Cloud9开始初始化博客，这里Octopress会自动连接上你刚刚新建的Repo。

    rake setup_github_pages

编辑生成了`_config.yml`和`Rakefile`, 除了博客以外，以后基本上只需要设置和修改这两个文件。
首先在`_config.yml`中写入博客名和其他信息（前面一些基本信息），开始写第一篇博客：

    rake new_page["About"]    # 添加博客页
    rake new_post["Hello World"]  # 新建一篇文章
    

添加deploy.sh，以后一键运行发布到Github：
{% codeblock deploy.sh %}
rake generate      # 生成页面
#rake preview      # 如果需要在本地预览生成的结果，预览页http://localhost:4000 
rake deploy        # 发布到Github中的master分支，即username.github.io真正看到的
# 发布源文件到Github的source分支
git add .
git commit -m 'Added About page and first post!'
git push origin source
{% endcodeblock %}

以后每次新建一个post，然后在`octopress/source/_posts/` 下书写markdown，发布即可。
如果要在Clou9本地生成预览结果，需要稍微修改一下`Rakefile`文件。

    #server_port     = "4000"      # port for preview server eg. localhost:4000
    server_host     = ENV['IP'] ||= '0.0.0.0'     # server bind address for preview server
    server_port     = ENV['PORT'] ||= "8080"      # port for preview server eg. localhost:4000

    #rackupPid = Process.spawn("rackup --port #{server_port}")
    rackupPid = Process.spawn("rackup --host #{server_host} --port #{server_port}")

然后输入`rake preview`命令后即可本地即时编辑查看，开启服务后，外部游览器访问地址为：
> https://workspacename-username.c9.io/

其中，workspacename是你创建该Clou9 workspace时输入的名字， username是你Clou9的用户名。

### 3. 主题和插件

Jekyll和Octopress是类似于Wordpress的平台，可以安装任意主题(Themes)和插件(Plugins)。

1. Jekyl推荐主题在[这里](http://jekyllthemes.org/), 还有各种站点在[这里](https://github.com/jekyll/jekyll/wiki/Sites)。
2. Octopress推荐主题在这里[这里](https://github.com/imathis/octopress/wiki/3rd-Party-Octopress-Themes), 附带安装命令。这里用的是`whitespace`主题。

插件方面我用了

- Disqus: 用来添加评论功能。在Disqus创建好账号后点击`Settings`，点击`Add Disqus to Site`，就可以为个人博客站点创建一个`short name`，把它添加到`_config.yml`中的`disqus_short_name`后面即可。

- Google Analytics: 在Google Analytics中获取跟踪ID，添加到`_config.yml`中的`google_analytics_tracking_id`。

- 分类，标签以及3D标签云： 参考了[文章1](http://812lcl.com/blog/2013/10/26/octopressce-bian-lan-ji-ping-lun-xi-tong-ding-zhi/)
和[文章2](http://agiledon.github.io/blog/2013/01/08/create-tag-for-octopress/)。两篇文章其实是做的同样的事情。
文章1比较简单明了，但遗漏了一些东西，文章2做了相印的补充。


我陆续碰到了如下问题：

1. `category_generator.rb`直接用自带的，不用替换。
2. 缺`source/_layouts/tag_index.html`。 解决方法： 新建`tag_index.html`, 复制`category_index.html`的代码。把categories改成tags, 把category改成tag。
2. 缺`source/_includes/custom/tag_feed.xml`。解决方法： 新建`tag_feed.xml`, 复制`category_feed.xml`的代码。把categories改成tags, 把category改成tag。
1. 缺`source/javascripts/tagcloud.swf`。 解决方法：在[这里](https://github.com/shangfu/shangfu.github.io/tree/source/source/javascripts) 把`tagcloud.swf` 下载下来，并且放到对应目录。

另外由于我的主题没有设置边栏(asides)，所以我新建了一个page, named category, 来显示categories和tags的结果。

{% codeblock lang:html category/index.markdown %}
{% raw %}
---
layout: page
title: "category"
comments: false
sharing: false
footer: true
---
<div id='Category-cloud'>
    <style>
    #left,#right {float:left; width:400px}
    </style>
    <div id="main">
        <div id="left">
             <h1>Category List</h1>
             <ul id="categories">
                 {% category_list %}
             </ul>
        </div>
        <div id="right">
            <h1>Tag List</h1>
            <ul class="tag-cloud">
                {% tag_list font-size: 90-210%, limit: 10, style: para %}
            </ul>
        </div>
        <div style="clear:both"></div>
    </div>
    
    <style>
    #left,#right {float:left; width:400px}
    </style>
    <div id="main">
        <div id="left">
            <h1>Category Cloud</h1>
            <ul class="category-cloud">
                {% category_cloud bgcolor:#f2f2f2 %}
            </ul>
        </div>
        <div id="right">
            <h1>Tag Cloud</h1>
            <ul id="Tag-cloud">
                {% tag_cloud bgcolor:#f2f2f2 %}
            </ul>
        </div>
        <div style="clear:both"></div>
    </div>
</div>
{% endraw %}
{% endcodeblock %}


###Bug
在添加超过一个tags之后，`rake generate`可能会开始报错了

> Liquid Exception: comparison of Array with Array failed in page  

解决办法是在 `plugins/tag_list.rb` 中修改代码：

{% codeblock lang:rb plugins/tag_list.rb %}
weighted = count.map do |name, count|
  # logarithmic distribution
#  weight = (Math.log(count) - Math.log(min))/(Math.log(max) - Math.log(min))
   if min == max   #ADDED
      weight = 1    #ADDED
   else            #ADDED
      weight = (Math.log(count) - Math.log(min))/(Math.log(max) - Math.log(min)) #ADDED
   end             #ADDED
  [name, weight]
end
{% endcodeblock %}

### 5. 开始使用
以上都做完后，终于可以轻松地写博客了。
每次`rake new_post[""]`新建一个post。
运行 `rake preview`, 一边编写markdown内容一边查看。
添加category和tags，比如

    ---
    layout: post
    title: "快速搭建Github Page个人博客"
    date: 2015-08-20 14:53:32 +0000
    comments: true
    categories: Technic
    tags: [Blog, Cloud9, Github, Octopress]
    ---

最后运行我们直接写好的`deploy.sh`发布到github。

### 4. 域名绑定
Github 提供了CNAME域名绑定。在Namesilo 上注册帐号，然后进入Manage My Domains, 选择域名后，进入 DNS Records UPDATE。

1. 新建A类解析，`HOSTNAME` 留空， IPV4 address 设为 `ping username.github.io` 返回的ip即可。
2. 新建CNAME解析， `HOSTNAME` 设为 `www`，`TARGET HOSTNAME` 设为你的`username.github.io`。
3. 在你的`octopress/source/`目录下，新建文件`CNAME`, 在该文件第一行写上你的域名，如`whyalgorithm.com`，保存。然后运行 `deploy.sh` 上传到github。
脚本会自动把`CNAME` 文件复制到`octopress/_deploy`目录下，并上传到github master 分支中。
4. 耐心等待一会儿。
