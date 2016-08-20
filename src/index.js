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
    accept: '*/*',
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
    }
});
var _options = Upload.sole();
var _contentEl = Upload.sole();
var _inputFileEl = Upload.sole();
var _resetInputFile = Upload.sole();
var _upload = Upload.sole();
var pro = Upload.prototype;

// 重置 input
pro[_resetInputFile] = function () {
    var the = this;
    var options = the[_options];

    if (the[_inputFileEl]) {
        modification.remove(the[_inputFileEl]);
        the[_inputFileEl].onchange = null;
        the[_inputFileEl] = null;
    }

    var inputFileEl = modification.create('input', {
        type: 'file',
        name: options.name,
        accept: options.accept,
        'class': namespace + '-file',
        id: namespace + index++
    });

    inputFileEl.multiple = options.multiple;
    modification.insert(inputFileEl, the[_contentEl]);
    inputFileEl.onchange = function () {
        if (inputFileEl.value) {
            the[_resetInputFile]();
            the[_inputFileEl] = inputFileEl;

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
    var inputFileEl = the[_inputFileEl];

    if (!inputFileEl) {
        return;
    }

    the[_inputFileEl] = null;
    options.onUpload(inputFileEl, function (err, url) {
        the.emit('afterUpload', inputFileEl);

        if (err) {
            return the.emit('error', err);
        }

        the.emit('success', url);
    });
};

require('./style.css', 'css|style');
Upload.defaults = defaults;
module.exports = Upload;
