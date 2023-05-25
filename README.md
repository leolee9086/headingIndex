## 使用方法

插件安装之后顶栏会增加一个序号选择按钮，图标跟有序列表的图标类似。

左键点击按钮上传配置文件，安全上下文内右键点击打开配置文件上传菜单。

## 配置文件格式

配置文件名既菜单中显示的选项名

### 全局配置文件

菜单中选择的配置文件会作为默认的标题编号样式。

当这个样式应用出错时会在菜单内显示错误。

### 文档配置文件

文档配置文件由文档的custom-index-scheme确定。

### 配置项目写法

以js配置为例（json写法类似）

```js
 [
     "第{h1.ch}篇"
    ,
     "第{h2.en}章"
    ,
     "第{h3.roman}节"
    ,
     "({h4.ch}):"
    ,
     "{h5}"
    ,
    "{h6}"
    
  ]

```
形如中括号`{}`内的项目会被标题编号变量代替

h1 渲染为一级标题编号

h2 渲染为二级标题编号，依此类推

请勿嵌套中括号

默认提供一些简单的格式化函数：

`h1.ch`表示一级标题编号的中文数字小写形式；

`h1.en`表示一级标题编号的英文单词形式;

`h1.roman`表示一级标题编号的罗马数字形式.

`h1.ABC` 表示字母大写形式.

`h1.abc` 表示字母小写形式.

`h1.CH` 表示大写中文字符形式.


依此类推。

编号仅考虑标题。

插件文件夹中自带了四个设置实例，你可以尝试参考自己修改出自己喜欢的样式。