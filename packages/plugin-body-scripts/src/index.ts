import {IApi} from "umi";

export default (api: IApi) => {
    api.describe({
        key: 'bodyScripts',
        config: {
            schema({ zod }) {
                return zod.array(zod.union([
                    zod.string(),
                    zod.object({
                        src: zod.string()
                    }),
                    zod.object({
                        content: zod.string()
                    })
                ])).optional();
            },
        },
        enableBy: api.EnableBy.config,
    });

    api.modifyHTML(($) => {
        // 需要在umi.js 之前引入
        const mountElementId = api.config.mountElementId||'root';
        // 添加脚本
        const bodyScripts = api.config.bodyScripts;
        if(bodyScripts && bodyScripts.length){
            $(`#${mountElementId}`).after(bodyScripts.map((script:string|{src:string}|{content:string})=>{
                if(typeof script ==='string'){
                    // 判断是脚本还是代码
                    if(/^(http:\/\/|https:\/\/|\/\/)/.test(script)){
                        return `<script src='${script}'></script>`;
                    }
                    return `<script>${script}</script>`;
                }
                if(typeof script ==='object' && 'src' in script){
                    return `<script src='${script.src}'></script>`
                }
                if(typeof script ==='object' && 'content' in script){
                    return `<script>${script.content}</script>`
                }
            }))
        }
        return $;
    });
};
