# @middle-cli/plugin-hc

辉创插件，提供接入辉创默认配置及通用数据逻辑

## Install

```bash
pnpm i @middle-cli/plugin-hc
```

## Usage

Configure in `.umirc.ts`,

```js
export default {
  hc:{}
}
```

## Options

TODO

## LICENSE

MIT

1. 提供wrapper 来包裹layout并传入props进去
2. 提供静态方法修改badge数据等。 两种方式。 一个内部管理，一个外部管理。
3. 提供menu数据二次处理的入口。
