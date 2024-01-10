/*
 * @author: yanxianliang
 * @date: 2024-01-08 15:11
 * @desc: $Desc$
 *
 * Copyright (c) 2024 by yanxianliang, All Rights Reserved.
 */
import { Button, Checkbox, Form, Input, Tag } from 'antd';

const FormItem = Form.Item;

const SignIn = () => {
  const [form] = Form.useForm();
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);

      fetch(`/signinSpa`, {
        method: 'POST',
        body: formData,
        redirect: 'manual',
      })
        .then(() => {
          return (window.location.href = '/');
        })
        .catch(() => {});
    });
  };
  return (
    <Form form={form} style={{ width: 400, margin: '60px auto' }}>
      <FormItem
        label={'账号'}
        name={'username'}
        rules={[{ required: true, message: '请输入用户名' }]}
        initialValue={'BzHkfDOxOYuVPBKjDZzRxg=='}
      >
        <Input placeholder="用户名" />
      </FormItem>
      <FormItem
        label={'密码'}
        name={'password'}
        rules={[{ required: true, message: '请输入密码' }]}
        initialValue={'vRJLnxN95wBs3IRZs1fY2g=='}
      >
        <Input placeholder="密码" />
      </FormItem>
      <FormItem name={'remember'} valuePropName={'checked'} initialValue={true}>
        <Checkbox>记住我</Checkbox>
      </FormItem>
      <Button onClick={handleSubmit} type="primary" block={true}>
        登录
      </Button>
      <div style={{ marginTop: 20 }}>
        <Tag>书丽</Tag>
        <div>YVezloKzg66LTwnSXJOOkA==</div>
        <div>bCtw7okXgKIlcG6YEaWTog==</div>
      </div>
    </Form>
  );
};

export default SignIn;
