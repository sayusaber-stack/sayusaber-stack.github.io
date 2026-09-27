---
layout: default
title: Diary
---
<section class="section" style="padding-top:70px"><p class="eyebrow">EVERYDAY NOTES</p><h1 style="font:500 60px 'Cormorant Garamond',serif">Diary</h1><div class="cards">{% for post in site.posts %}{% if post.category == 'diary' %}<article class="card"><a href="{{post.url | relative_url}}"><div class="card-image"><span>DIARY</span></div></a><div class="card-body"><p class="meta">{{post.date|date:"%Y.%m.%d"}}</p><h3><a href="{{post.url | relative_url}}">{{post.title}}</a></h3><p>{{post.excerpt|strip_html|truncate:100}}</p></div></article>{% endif %}{% endfor %}</div></section>
