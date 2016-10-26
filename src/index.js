/**
 * blear.ui.upload
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var Dialog = require('blear.ui.dialog');
var object = require('blear.utils.object');
var Template = require('blear.classes.template');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');

var template = require('./template.html');

var namespace = 'blearui-upload';
var index = 0;
var tpl = new Template(template);
var defaults = {
    dialog: {
        width: 800,
        title: '上传文件'
    },
    tips: '点击选择文件并上传',
    name: 'file',
    accept: null,
    multiple: false,
    onUpload: function (fileInputEl, done) {
        done(new Error('未配置上传'));
    }
};

var Upload = Dialog.extend({
    className: 'Upload',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        Upload.parent(the, the[_options].dialog);
        Upload.superInvoke('setHTML', the, tpl.render({
            options: the[_options]
        }));
        the[_contentEl] = selector.query('.' + namespace + '-content', the.getContainerEl())[0];
        the[_resetInputFile]();
    },


    /**
     * 获取内容区域元素对象
     * @returns {HTMLDivElement}
     */
    getContentEl: function () {
        return this[_contentEl];
    },

    /**
     * 主动上传
     * @returns {Upload}
     */
    upload: function () {
        var the = this;
        the[_upload]();
        return the;
    },


    /**
     * 重置上传输入框
     * @returns {Upload}
     */
    reset: function () {
        var the = this;

        if(the[_lastInputFileEl]){
            modification.remove( the[_lastInputFileEl]);
            the[_lastInputFileEl] = null;
        }
        return the;
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        the[_nextInputFileEl].onchange = null;
        the[_nextInputFileEl] = null;
        the[_lastInputFileEl] = null;
        modification.remove(the[_contentEl]);
        the[_contentEl] = null;
        Upload.superInvoke('destroy', the);
    }
});
var _options = Upload.sole();
var _contentEl = Upload.sole();
var _nextInputFileEl = Upload.sole();
var _lastInputFileEl = Upload.sole();
var _resetInputFile = Upload.sole();
var _upload = Upload.sole();
var pro = Upload.prototype;

// 重置 input
pro[_resetInputFile] = function () {
    var the = this;
    var options = the[_options];
    var attributes = {
        type: 'file',
        name: options.name,
        'class': namespace + '-file',
        id: namespace + index++,
        tabIndex: -1
    };

    // chrome 下，accept 条件越宽反应越慢
    if (options.accept) {
        attributes.accept = options.accept;
    }

    var inputFileEl = the[_nextInputFileEl] = modification.create('input', attributes);

    inputFileEl.multiple = options.multiple;
    modification.insert(inputFileEl, the[_contentEl], 'afterbegin');
    inputFileEl.onchange = function () {
        if (inputFileEl.value) {
            the[_resetInputFile]();
            the[_lastInputFileEl] = inputFileEl;
            inputFileEl.onchange = null;
            attribute.hide(inputFileEl);

            if (the.emit('beforeUpload', inputFileEl) === false) {
                return;
            }

            // 被动上传
            the[_upload]();
        }
    };
};


// 切换模式
pro[_upload] = function () {
    var the = this;
    var options = the[_options];
    var inputFileEl = the[_lastInputFileEl];

    if (!inputFileEl) {
        return;
    }

    the[_lastInputFileEl] = null;
    options.onUpload(inputFileEl, function (err, url) {
        the.emit('afterUpload', inputFileEl);
        the.reset();

        if (err) {
            return the.emit('error', err);
        }

        the.emit('success', url);
    });
};

require('./style.css', 'css|style');
Upload.defaults = defaults;
module.exports = Upload;
