//思源笔记折腾记录-快速开关代码片段
//http://127.0.0.1:55484/stage/build/desktop/?r=r4eq8ar&&blockID=20230426000214-g9ic2p1
//siyuan://blocks/20230426000214-g9ic2p1
//之前我们已经弄了在笔记内以文档的形式写代码片段的活儿了，但是这些代码片段还是要去设置界面才能开关，有点不大方便，所以这回来整个新的活，让它们更方便开关一点点。
//首先还是要引入依赖，这回因为需要工具栏和保存代码片段，所以我们需要这两个东西
const { Plugin } = require("siyuan");
const clientApi = require("siyuan");
let 核心api;
let path;
let 思源工作空间;
let importDep;
let 当前选项按钮;
let that;
let template;
class headingIndex extends Plugin {
  onload() {
    this.selfURL = `/plugins/${this.constructor.name}`;
    this.dataPath = `/data/storage/petal/${this.constructor.name}`;
    that = this;
    this.设置字典 = {};
    this.当前默认设置 = [];
    this.已提示块 = [];
    this.生成顶栏();
    this.增加编辑器生成菜单();
    this.添加页面();
    this.初始化();
  }
  增加编辑器生成菜单() {
   

    this.eventBus.on("click-editortitleicon", (e) => {
      let { menu, data } = e.detail;

      menu.addItem({
        icon: "iconOrderedList",
        label: this.i18n.设置序号生成方式,
        submenu: [
          {
            icon: "iconOrderedList",
            label: this.i18n.刷新序号,
            click: () => {
              生成标题序号(that.设置字典, data.id);
            },
          },
          {
            icon: "iconEdit",
            label: this.i18n.写入序号,
            click: async () => {
              clientApi.confirm(
                "⚠️",
                this.i18n["生成可能需要很长时间,是否确认继续?"],
                async () => {
                  await 生成文档内标题序号(data.id, that.设置字典, true);
                }
              );
            },
          },
        ],
      });

      let _submenu = [];
      Object.getOwnPropertyNames(this.设置字典).forEach((item) => {
        if (item == "当前全局配置") {
          return;
        }
        _submenu.push({
          label: this.i18n.使用序号类型 + item,
          click: async () => {
            await 核心api.setBlockAttrs({
              id: data.id,
              attrs: { "custom-index-scheme": item },
            });
          },
        });
      });
      menu.addItem({
        icon: "iconOrderedList",
        label: this.i18n.选择序号类型,
        submenu: _submenu,
      });
    });
  }
  添加页面() {
    let plugin = this;
    this.customTab = this.addTab({
      type: "editor",
      init() {
        this.data.content.forEach((标题样式, i) => {
          console.log(i);
          this.element.insertAdjacentHTML(
            "beforeend",
            `<label class="fn__flex b3-label">
              <div class="fn__flex-1">
                  h${i + 1}
                  <div class="b3-label__text">${
                    plugin.i18n[数字转中文(i + 1) + "级标题编号样式"]
                  }</div>
              </div>
              <span class="fn__space"></span>
              <input class="b3-text-field fn__flex-center" data-level="${i}" >
              </label>`
          );
          this.element.querySelector(`[data-level="${i}"]`).value = 标题样式;
          this.element
            .querySelector(`[data-level="${i}"]`)
            .addEventListener("change", async (e) => {
              this.data.content[i] = e.target.value;
            });
        });

        this.element.insertAdjacentHTML(
          "beforeend",
          `
          <label class="fn__flex b3-label config__item">
    <div class="fn__flex-1">
        保存配置文件
        <div class="b3-label__text">${this.data.name}.json</div>
    </div>
    <div class="fn__space"></div>
    <div class="fn__size200 config__item-line fn__flex-center">
    <button  class="b3-button b3-button--outline fn__size200 fn__flex-center" >
          确定
    </button>

    </div>
</label>
          `
        );
        this.element.querySelectorAll(`button`).forEach((button) => {
          button.addEventListener("click", async (e) => {
            if (e.target.dataSet && e.target.dataSet.enable) {
              await 思源工作空间.writeFile(
                JSON.stringify(
                  { name: this.data.name, content: this.data.content },
                  undefined,
                  2
                ),
                path.join(plugin.dataPath, "lastValue.json")
              );
            }
            await 思源工作空间.writeFile(
              JSON.stringify(this.data.content, undefined, 2),
              path.join(plugin.dataPath, this.data.name + ".json")
            );
            await plugin.初始化();
            e.stopPropagation();
          });
        });
      },
      async destroy() {
        await 思源工作空间.writeFile(
          JSON.stringify(this.data.content, undefined, 2),
          path.join(plugin.dataPath, this.data.name + ".json")
        );
        await plugin.初始化();
      },
    });
  }
  onunload() {
    this.停止监听编辑();
    this.样式元素.remove();
  }
  停止监听编辑() {
    this.eventBus.off("ws-main", this.ws监听器);
  }
  async 初始化() {
    path = (await import(this.selfURL + "/polyfills/path.js"))["default"];
    importDep = async (moduleName) => {
      return await import(path.join(this.selfURL, moduleName));
    };
    核心api = (await importDep("./polyfills/kernelApi.js"))["default"];
    思源工作空间 = (await importDep("./polyfills/fs.js"))["default"];
    await this.覆盖默认设置();
    await this.获取全部设置();
    document
      .querySelectorAll("#headingIndexStyle")
      .forEach((el) => el.remove());
    this.样式元素 = document.createElement("style");
    this.样式元素.setAttribute("id", "headingIndexStyle");
    this.样式元素.textContent = `
    .protyle-wysiwyg [data-node-id].li[data-subtype="t"] .protyle-action.protyle-action--task:before {
      content:var(--custom-index) ;        
  }
  .protyle-wysiwyg [data-type="NodeHeading"] [contenteditable]:before{
      content:var(--custom-index);
  }
  .sy__outline [data-node-id] .b3-list-item__text:before{
      content:var(--custom-index);
  }
    `;
    let scriptEl = document.createElement("script");
    scriptEl.textContent = await (
      await fetch(path.join(this.selfURL, "static", "art-template-web.js"))
    ).text();
    let iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("href", "about:blank");
    document.body.appendChild(iframe);
    iframe.contentDocument.head.appendChild(scriptEl);
    template = iframe.contentWindow.template;
    document.head.appendChild(this.样式元素);
    console.log(this.设置字典);
    生成标题序号(this.设置字典);
    this.eventBus.on("ws-main", this.ws监听器);
  }
  生成顶栏() {
    this.顶栏按钮 = this.addTopBar({
      icon: "iconOrderedList",
      title: this.i18n.addTopBarIcon,
      position: "right",
      callback: () => {
        this.创建菜单();
      },
    });
    this.顶栏按钮.addEventListener("contextmenu", async () => {
      if (!window.isSecureContext) {
        return;
      }
      try {
        let 文件数组 = await window.showOpenFilePicker({
          types: [
            {
              description: "配置文件",
              accept: {
                "application/javascript": [".js"],
                "application/json": [".json"],
              },
            },
          ],
          excludeAcceptAllOption: true,
          multiple: true,
        });
        for await (let 文件句柄 of 文件数组) {
          let name = 文件句柄.name;
          let file = await 文件句柄.getFile();
          await 思源工作空间.writeFile(file, path.join(this.dataPath, name));
        }
        await this.初始化();
      } catch (e) {
        console.error(e);
      }
    });
  }
  创建菜单() {
    const menu = new clientApi.Menu("topBarSample", () => {});
    let 配置文件名数组 = Object.getOwnPropertyNames(this.设置字典);
    for (let i = 0, len = 配置文件名数组.length; i < len; i++) {
      let name = 配置文件名数组[i];
      try{
      this.添加配置文件选择菜单项(menu, name);
      }catch(e){
        console.error(e)
      }
    }
    menu.addSeparator();
    menu.addItem({
      icon: "iconAdd",
      label: this.i18n.添加配置文件,
      click: () => {
        let Dialog;
        Dialog = new clientApi.Dialog({
          title: "输入文件名,留空取消",
          content: `<div class="fn__flex"><input class="fn__flex-1 b3-text-field  b3-filter" placeholder="输文件名,留空取消"></div>`,
          width: "400px",
          height: "96px",
          destroyCallback: async () => {
            let name = Dialog.element.querySelector("input").value;
            if (name) {
              let reg = new RegExp('[\\\\/:*?"<>|]');
              if (reg.test(name)) {
                return;
              }
              let 新配置文件路径 = path.join(this.dataPath, name + ".json");
              await 思源工作空间.writeFile(
                '["","","","","",""]',
                新配置文件路径
              );
            }
            await this.初始化();
          },
        });
      },
    });
    menu.open(this.顶栏按钮.getBoundingClientRect());
  }
  添加配置文件选择菜单项(menu, name) {
    if (name == "当前全局配置") {
      return;
    }
    let content = this.设置字典[name];
    let element = document.createElement("button");
    if (this.设置字典.当前全局配置.name == name) {
      element.style.backgroundColor = "var(--b3-card-success-background)";
      当前选项按钮 = element;
    }
    element.setAttribute("class", "b3-menu__item");
    element.innerHTML += `<span class="b3-menu__label">${name
      .split("/")
      .pop()}</span>`;
    element.innerHTML +=
      '<svg class="b3-menu__icon"><use xlink:href="#iconEdit"></use></svg>';
    menu.menu.append(element);
    element.addEventListener("click", (e) => {
      if (e.target.tagName == "svg" || e.target.tagName == "use") {
        this.打开编辑页面(content, name);
        return;
      }
      this.设置字典.当前全局配置.name = name;
      this.设置字典.当前全局配置.content = content;
      生成标题序号(this.设置字典);
      this.saveData(
        "lastValues.json",
        JSON.stringify({ name: name, content: content })
      );
      menu.close();
    });
  }
  async 打开编辑页面(content, name) {
    const tab = clientApi.openTab({
      app: this.app,
      custom: {
        icon: "iconHeading",
        title: name,
        data: {
          content: content,
          name: name,
        },
        fn: this.customTab,
      },
    });
    console.log(tab);
  }
  async 覆盖默认设置() {
    let jsContent = await (await fetch(this.selfURL + "/实例设置1.js")).text();
    let jsonContent = await (
      await fetch(this.selfURL + "/实例设置2.json")
    ).json();
    await 思源工作空间.writeFile(
      jsContent,
      path.join(this.dataPath, "实例设置1.js")
    );
    if (
      !(await 思源工作空间.exists(path.join(this.dataPath, "实例设置2.json")))
    ) {
      await 思源工作空间.writeFile(
        JSON.stringify(jsonContent),
        path.join(this.dataPath, "实例设置2.json")
      );
    }
    if (
      await 思源工作空间.exists(path.join(this.dataPath, "lastValues.json"))
    ) {
      try {
        this.设置字典.当前全局配置 = JSON.parse(
          await 思源工作空间.readFile(
            path.join(this.dataPath, "lastValues.json")
          )
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  async 获取全部设置() {
    let 全部配置 = await 思源工作空间.readDir(this.dataPath);
    for await (let 配置项 of 全部配置) {
      if (!(配置项.isDir || 配置项.name == "lastValues.json")) {
        let 配置路径 = path.join(this.dataPath, 配置项.name);
        let 配置内容 = 配置项.name.endsWith(".js")
          ? await 读取js配置(配置路径)
          : await 读取json配置(配置路径);
        if (!配置内容 instanceof Array) {
          console.warn(配置项.name + "没有导出数组");
        } else if (配置内容.length < 6) {
          配置项.name + "没有配置全部标题序号";
        }
        this.设置字典[配置项.name.split(".")[0]] = 配置内容;
        if (
          this.设置字典.当前全局配置 &&
          this.设置字典.当前全局配置.name == 配置项.name.split(".")[0]
        ) {
          this.设置字典.当前全局配置.content = 配置内容;
        }
      }
    }
  }
  async ws监听器(detail) {
    await 生成标题序号(that.设置字典);
  }
}
module.exports = headingIndex;
async function 读取js配置(配置路径) {
  let jsContent = (await 思源工作空间.readFile(配置路径)).toString();
  let blob = new Blob(
    [数字转中文.toString() + "\n" + jsContent + '\n//# sourceURL="' + 配置路径],
    { type: "application/javascript" }
  );
  let moduleURL = URL.createObjectURL(blob);

  return (await import(moduleURL)).default;
}
async function 读取json配置(配置路径) {
  let jsonContent = await 思源工作空间.readFile(配置路径);
  return JSON.parse(jsonContent);
}
let 已提示块 = {};
async function 生成标题序号(序号设置字典, 文档id) {
  if (文档id) {
    await 生成文档内标题序号(文档id, 序号设置字典);
  }
  let 文档面包屑数组 = document.querySelectorAll(
    ".protyle-breadcrumb__bar span:first-child[data-node-id]"
  );
  文档面包屑数组.forEach(async (文档面包屑元素) => {
    let 文档id = 文档面包屑元素.getAttribute("data-node-id");
    try {
      let 预取内容 = await 核心api.getDoc({ id: 文档id, size: 1 });
      if (已提示块[文档id]) {
        return;
      }
      if (预取内容.blockCount > 1024) {
        let 文档信息 = await 核心api.getDocInfo({ id: 文档id });
        核心api.pushMsg({
          msg: `${文档信息.name}内块数量为${预取内容.blockCount},超过阈值,请手动生成`,
        });
        已提示块[文档id] = true;
        return;
      }

      await 生成文档内标题序号(文档id, 序号设置字典);
    } catch (e) {
      console.warn(e);
      if (当前选项按钮 && 当前选项按钮.parentElement) {
        当前选项按钮.style.backgroundColor = "var(--b3-card-error-background)";
        当前选项按钮.parentElement.insertAdjacentHTML(
          "beforeend",
          Lute.EscapeHTMLStr(e.toString())
        );
      }
    }
  });
}

async function 生成文档内标题序号(文档id, 序号设置字典, 写入序号) {
  let 文档内容 = await 核心api.getDoc({ id: 文档id, size: 102400 });
  let 文档信息 = await 核心api.getDocInfo({ id: 文档id });
  /*if(文档内容.content.lenth>100000){
    return
  }*/
  let 当前序号设置 = 序号设置字典.当前全局配置.content;
  if (文档信息.ial && 文档信息.ial["custom-index-scheme"] === "null") {
    return;
  }
  if (文档信息.ial && 文档信息.ial["custom-index-scheme"]) {
    当前序号设置 =
      序号设置字典[文档信息.ial["custom-index-scheme"]] || 当前序号设置;
  }
  if (!当前序号设置) {
    return;
  }
  let parser = new DOMParser();
  let 临时元素 = parser.parseFromString(文档内容.content, "text/html").body;
  //console.log(临时元素)
  // 临时元素.innerHTML = 文档内容.content;
  let 标题元素数组 = 临时元素.querySelectorAll(
    '[data-type="NodeHeading"]:not( [data-type="NodeBlockQueryEmbed"] div)'
  );
  let 计数器 = [0, 0, 0, 0, 0, 0];
  let 上一个标题级别 = 1;
  for (let i = 0; i < 标题元素数组.length; ++i) {
    let 标题元素 = 标题元素数组[i];

    if (!标题元素数组[i].querySelector("[contenteditable]")) {
      return;
    }
    if (!标题元素数组[i].querySelector("[contenteditable]").innerText) {
      let 标题id = 标题元素数组[i].getAttribute("data-node-id");
      document
        .querySelectorAll(`.protyle-wysiwyg div[data-node-id='${标题id}']`)
        .forEach((一级标题元素) => {
          一级标题元素
            .querySelector("[contenteditable]")
            .style.removeProperty("--custom-index");
        });
      return;
    }
    let 当前标题级别 = parseInt(
      标题元素数组[i].getAttribute("data-subtype").replace("h", "")
    );
    if (当前标题级别 <= 上一个标题级别) {
      for (let j = 0; j < 计数器.length; ++j) {
        if (j + 1 > 当前标题级别) {
          计数器[j] = 0;
        }
      }
    }
    计数器[当前标题级别 - 1] += 1;
    let 标题id = 标题元素数组[i].getAttribute("data-node-id");
    if (!当前序号设置[当前标题级别 - 1]) {
      document
        .querySelectorAll(`.protyle-wysiwyg div[data-node-id='${标题id}']`)
        .forEach(async (标题元素) => {
          let 内容元素 = 标题元素.querySelector("[contenteditable]");
          内容元素.setAttribute("style", `--custom-index:""`);
        });
      document
        .querySelectorAll(`.sy__outline [data-node-id=""]`)
        .forEach(async (大纲项目) => {
          大纲项目.setAttribute("style", `--custom-index:""`);
        });
    }
    if (当前序号设置[当前标题级别 - 1]) {
      let 当前序号;
      if (当前序号设置[当前标题级别 - 1] instanceof Function) {
        当前序号 = 当前序号设置[当前标题级别 - 1](计数器[当前标题级别 - 1]);
      } else {
        function h(级别) {
          let num = 计数器[级别 - 1];
          let obj = () => {
            return num;
          };

          (obj.num = num),
            (obj.ch = 数字转中文(num)),
            (obj.roman = numToRoman(num)),
            (obj.en = numToEnglish(num)),
            (obj.CH = 数字转中文(num, true));
          obj.abc = 数字转字母(num, false);
          obj.ABC = 数字转字母(num, true);
          obj.enth = numToEnglish(num, false);

          obj.toString = () => {
            return Obj.num;
          };

          return obj;
        }

        template.defaults.rules[1].test =
          /{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}/;
        let string = 当前序号设置[当前标题级别 - 1];
        let render = template.compile(string);
        当前序号 = render({
          h1: h(1),
          h2: h(2),
          h3: h(3),
          h4: h(4),
          h5: h(5),
          h6: h(6),
        });
      }
      if (写入序号) {
        let 旧标题序号元素 = 标题元素.querySelector(
          'span[style~="--custom-index:true"]'
        );
        if (旧标题序号元素) {
          旧标题序号元素.remove();
        }
        标题元素
          .querySelector('[contenteditable="true"]')
          .insertAdjacentHTML(
            "afterBegin",
            `<span style="--custom-index:true">${当前序号}</span>`
          );
        await 核心api.updateBlock({
          dataType: "dom",
          data: 标题元素.outerHTML,
          id: 标题id,
        });
        document
          .querySelectorAll(`.protyle-wysiwyg div[data-node-id='${标题id}']`)
          .forEach(async (标题元素) => {
            let 内容元素 = 标题元素.querySelector("[contenteditable]");
            内容元素.setAttribute("style", ``);
          });
        document
          .querySelectorAll(`.sy__outline [data-node-id="${标题id}"]`)
          .forEach(async (大纲项目) => {
            大纲项目.setAttribute("style", ``);
          });
      } else {
        document
          .querySelectorAll(`.protyle-wysiwyg div[data-node-id='${标题id}']`)
          .forEach(async (标题元素) => {
            let 内容元素 = 标题元素.querySelector("[contenteditable]");
            内容元素.setAttribute("style", `--custom-index:"${当前序号}"`);
          });
        document
          .querySelectorAll(`.sy__outline [data-node-id="${标题id}"]`)
          .forEach(async (大纲项目) => {
            大纲项目.setAttribute("style", `--custom-index:"${当前序号}"`);
          });
      }
      上一个标题级别 = 当前标题级别 + 0;
    }
  }
}

//作者：houyhea
//链接：https://juejin.cn/post/6844903473255809038
//来源：稀土掘金
//著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
function 数字转中文(digit, 大写) {
  digit = typeof digit === "number" ? String(digit) : digit;
  let zh = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  let unit = ["千", "百", "十", ""];
  if (大写) {
    zh = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    unit = ["仟", "佰", "拾", ""];
  }
  const quot = [
    "万",
    "亿",
    "兆",
    "京",
    "垓",
    "秭",
    "穰",
    "沟",
    "涧",
    "正",
    "载",
    "极",
    "恒河沙",
    "阿僧祗",
    "那由他",
    "不可思议",
    "无量",
    "大数",
  ];

  let breakLen = Math.ceil(digit.length / 4);
  let notBreakSegment = digit.length % 4 || 4;
  let segment;
  let zeroFlag = [],
    allZeroFlag = [];
  let result = "";

  while (breakLen > 0) {
    if (!result) {
      // 第一次执行
      segment = digit.slice(0, notBreakSegment);
      let segmentLen = segment.length;
      for (let i = 0; i < segmentLen; i++) {
        if (segment[i] != 0) {
          if (zeroFlag.length > 0) {
            result += "零" + zh[segment[i]] + unit[4 - segmentLen + i];
            // 判断是否需要加上 quot 单位
            if (i === segmentLen - 1 && breakLen > 1) {
              result += quot[breakLen - 2];
            }
            zeroFlag.length = 0;
          } else {
            result += zh[segment[i]] + unit[4 - segmentLen + i];
            if (i === segmentLen - 1 && breakLen > 1) {
              result += quot[breakLen - 2];
            }
          }
        } else {
          // 处理为 0 的情形
          if (segmentLen == 1) {
            result += zh[segment[i]];
            break;
          }
          zeroFlag.push(segment[i]);
          continue;
        }
      }
    } else {
      segment = digit.slice(notBreakSegment, notBreakSegment + 4);
      notBreakSegment += 4;

      for (let j = 0; j < segment.length; j++) {
        if (segment[j] != 0) {
          if (zeroFlag.length > 0) {
            // 第一次执行zeroFlag长度不为0，说明上一个分区最后有0待处理
            if (j === 0) {
              result += quot[breakLen - 1] + zh[segment[j]] + unit[j];
            } else {
              result += "零" + zh[segment[j]] + unit[j];
            }
            zeroFlag.length = 0;
          } else {
            result += zh[segment[j]] + unit[j];
          }
          // 判断是否需要加上 quot 单位
          if (j === segment.length - 1 && breakLen > 1) {
            result += quot[breakLen - 2];
          }
        } else {
          // 第一次执行如果zeroFlag长度不为0, 且上一划分不全为0
          if (j === 0 && zeroFlag.length > 0 && allZeroFlag.length === 0) {
            result += quot[breakLen - 1];
            zeroFlag.length = 0;
            zeroFlag.push(segment[j]);
          } else if (allZeroFlag.length > 0) {
            // 执行到最后
            if (breakLen == 1) {
              result += "";
            } else {
              zeroFlag.length = 0;
            }
          } else {
            zeroFlag.push(segment[j]);
          }

          if (
            j === segment.length - 1 &&
            zeroFlag.length === 4 &&
            breakLen !== 1
          ) {
            // 如果执行到末尾
            if (breakLen === 1) {
              allZeroFlag.length = 0;
              zeroFlag.length = 0;
              result += quot[breakLen - 1];
            } else {
              allZeroFlag.push(segment[j]);
            }
          }
          continue;
        }
      }
      --breakLen;
    }
    return result;
  }
}

//转换为罗马数字
function numToRoman(num) {
  const romanNumMap = {
    0: "",
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
  };
  // 拆分数字字符串
  let numStr = num.toString().split("");

  let romanNum = "";
  for (let i = 0; i < numStr.length; i++) {
    let digit = numStr[i];
    let nextDigit = numStr[i + 1];

    // 特殊情况4和9处理
    if (+digit === 4 && +nextDigit === 1) {
      romanNum += "IV";
      i++;
    } else if (+digit === 9 && +nextDigit === 1) {
      romanNum += "IX";
      i++;
    } else {
      // 如果大于5,拆分处理
      if (+digit > 5) {
        romanNum += romanNumMap[5];
        for (let j = 1; j < +digit - 5; j++) {
          romanNum += romanNumMap[1];
        }
      } else {
        romanNum += romanNumMap[+digit];
      }
    }
  }

  return romanNum;
}
const englishNumMap = {
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
  13: "thirteen",
  14: "fourteen",
  15: "fifteen",
  16: "sixteen",
  17: "seventeen",
  18: "eighteen",
  19: "nineteen",
  20: "twenty",
  30: "thirty",
  40: "forty",
  50: "fifty",
  60: "sixty",
  70: "seventy",
  80: "eighty",
  90: "ninety",
};

function numToEnglish(num) {
  let englishNum = "";

  if (num === 0) return englishNumMap[0];

  if (num < 20) return englishNumMap[num]; // 1-19

  if (num < 100) {
    // 20-99
    englishNum += englishNumMap[Math.floor(num / 10) * 10];
    englishNum += num % 10 === 0 ? "" : " " + numToEnglish(num % 10);
  } else if (num < 1000) {
    // 100-999
    englishNum += englishNumMap[Math.floor(num / 100)] + " hundred";
    if (num % 100 > 0) englishNum += " and " + numToEnglish(num % 100);
  } else if (num < 1e6) {
    // 1000-999999
    englishNum += numToEnglish(Math.floor(num / 1000)) + " thousand";
    if (num % 1000 > 0) englishNum += " " + numToEnglish(num % 1000);
  } else if (num < 1e9) {
    // 1e6-999999999
    englishNum += numToEnglish(Math.floor(num / 1e6)) + " million";
    if (num % 1e6 > 0) englishNum += " " + numToEnglish(num % 1e6);
  }

  return englishNum.trim();
}
function 数字转字母(num, upper) {
  if (num <= 26) {
    return upper
      ? String.fromCharCode(64 + num)
      : String.fromCharCode(64 + num).toLowerCase();
  } else {
    return num;
  }
}
