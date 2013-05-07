
define([
    'dollar',
    'mo/lang'
], function($){

    var RE_CKD_NAME = /([^\w-])ckd\-([\w\-]+)(?=[^\w\-])/;

    var exports = {

        mergeSource: mergeSource,

        getSource: function(node, raw){
            var sid = $(node).data('source');
            if (sid) {
                var source = raw.find('.' + sid);
                return source[0] && source;
            }
        },

        getHref: getHref,

        getText: getText,

        getInnerHTML: getInnerHTML,

        getOuterHTML: getOuterHTML,

        getCustom: getCustom,

        getHd: getHd,

        getItemData: getItemData,

        getItemDataOuter: getItemDataOuter

    }; 

    function getHref(nodes){
        if (!nodes) {
            return;
        }
        for (var href, i = 0, l = nodes.length; i < l; i++) {
            href = nodes[i].href;
            if (href) {
                return href;
            }
        }
    }

    function getText(nodes){
        return nodes.map(function(elm){
            return elm.textContent;
        }).join('');
    }

    function getInnerHTML(nodes){
        return nodes.map(function(elm){
            return elm.innerHTML;
        }, $).join('');
    }

    function getOuterHTML(nodes, name){
        return nodes.map(function(elm){
            var html = elm.outerHTML;
            if (!name) {
                return html;
            }
            return html.replace(RE_CKD_NAME, function($0, $1, $2){ 
                if ($2 === name) {
                    return $1 + 'ck-' + $2;
                } else {
                    return $0;
                }
            });
        }, $).join('');
    }

    function getCustom(tag, unit, raw, fn, ckdname){
        var tags = unit.find(tag);
        if (!tags.length) {
            return tags;
        }
        return tags.map(function(elm){
            var source = exports.getSource(elm, raw);
            if (source) {
                var content = source.find(tag);
                if (!content[0]) {
                    content = source;
                }
                return fn(content, elm, ckdname, raw);
            }
            return fn(elm, undefined, ckdname, raw);
        });
    }

    function mergeSource(data, custom, fn, raw){
        if (custom && typeof custom === 'object') {
            custom = fn(custom, null, null, raw);
            for (var i in custom) {
                if (custom[i] 
                        && (!(custom[i] instanceof Array) 
                            && true || custom[i].length)) {
                    data[i] = custom[i];
                }
            }
        }
        return data;
    }

    function getHd(source, custom){
        source = $(source);
        var data = source && {
            html: getInnerHTML(source),
            href: getHref(source)
        } || {};
        return mergeSource(data, custom, getHd);
    }

    function getItemData(item, custom, ckdname, raw){
        item = $(item);
        var title = item.find('.ckd-title'),
            title_data = title[0] ? getCustom('.ckd-title', item, raw, getItemDataInner, 'title')[0]
                : getInnerHTML(item), 
            title_url = title[0] ? (getCustom('.ckd-title-link', item, raw, getItemDataHref, 'title-link')[0]
                    || getCustom('.ckd-title', item, raw, getItemDataHref, 'title')[0])
                : getHref(item),
            author_data = getCustom('.ckd-author', item, raw, getItemDataInner, 'author')[0],
            author_url = getCustom('.ckd-author-link', item, raw, getItemDataHref, 'author-link')[0]
                || getCustom('.ckd-author', item, raw, getItemDataHref, 'author')[0];
        var data = {
            title: title_data,
            href: title_url,
            titlePrefix: getCustom('.ckd-title-prefix', item, raw, getItemDataOuter, 'title-prefix'),
            titleSuffix: getCustom('.ckd-title-suffix', item, raw, getItemDataOuter, 'title-suffix'),
            titleTag: getCustom('.ckd-title-tag', item, raw, getItemDataOuter, 'title-tag'),
            icon: getCustom('.ckd-icon', item, raw, getItemDataSrc, 'icon')[0],
            desc: getCustom('.ckd-desc', item, raw, getItemDataOuter, 'desc')
                .concat(getCustom('.ckd-subtitle', item, raw, getItemDataOuter, 'subtitle')),
            info: getCustom('.ckd-info', item, raw, getItemDataOuter, 'info'),
            content: getCustom('.ckd-content', item, raw, getItemDataOuter, 'content'),
            meta: getCustom('.ckd-meta', item, raw, getItemDataOuter, 'meta'),
            author: author_data,
            authorUrl: author_url,
            authorPrefix: getCustom('.ckd-author-prefix', item, raw, getItemDataOuter, 'author-prefix'),
            authorSuffix: getCustom('.ckd-author-suffix', item, raw, getItemDataOuter, 'author-suffix'),
            avatar: getCustom('.ckd-avatar', item, raw, getItemDataSrc, 'avatar')[0],
            authorDesc: getCustom('.ckd-author-desc', item, raw, getItemDataOuter, 'author-desc'),
            authorMeta: getCustom('.ckd-author-meta', item, raw, getItemDataOuter, 'author-meta')
        };
        return mergeSource(data, custom, getItemData, raw);
    }

    function getItemDataSrc(source){
        source = $(source);
        return source.attr('src');
    }

    function getItemDataHref(source){
        source = $(source);
        return getHref(source);
    }

    function getItemDataInner(source){
        source = $(source);
        return getInnerHTML(source);
    }

    function getItemDataOuter(source, custom, ckdname){
        source = $(source);
        return getOuterHTML(source, ckdname);
    }

    return exports;

});
