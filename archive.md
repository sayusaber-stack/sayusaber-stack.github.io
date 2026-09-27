---
layout: default
title: Archive
---
<section class="section" style="padding-top:70px"><p class="eyebrow">ALL STORIES</p><h1 style="font:500 60px 'Cormorant Garamond',serif">Archive</h1>{% for post in site.posts %}<p style="border-bottom:1px solid #ded1bf;padding:18px 0"><span class="meta">{{post.date|date:"%Y.%m.%d"}} · {{post.category|upcase}}</span><br><a href="{{post.url | relative_url}}" style="font-size:20px">{{post.title}}</a></p>{% endfor %}</section>
