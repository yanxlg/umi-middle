import {Result,Button} from 'antd';

const Page = ()=>{
  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉, 您无权限访问该页面，请联系管理员配置权限。"
      extra={<Button type="primary">返回首页</Button>}
    />
  )
}

export default Page;
