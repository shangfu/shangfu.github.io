---
layout: page
title: "category"
comments: false
sharing: false
footer: true
---

<div id='Category-cloud'>
    <style>
    #left,#right {float:left; width:450px}
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
    #left,#right {float:left; width:450px}
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