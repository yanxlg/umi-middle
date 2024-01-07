import {YHResult,YHButton} from '@yh/yh-design';

const Page = ()=>{
  return (
    <YHResult
      status="403"
      title="403"
      subTitle="抱歉, 您无权限访问该页面，请联系管理员配置权限。"
      extra={<YHButton type="primary">返回首页</YHButton>}
    />
  )
}

export default Page;
