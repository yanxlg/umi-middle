/*
 * @Author: yanxlg
 * @Date: 2023-05-27 18:11:50
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-27 18:19:55
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Switch,
} from "antd";
import { PromptObject, PromptType } from "prompts";
import React, { useEffect, useMemo, useRef, useState } from "react";

// 从cdn 获取选项json

interface IOption extends Omit<PromptObject, "choices" | "name" | "type"> {
  label: string; // 表单label
  name: string;
  type: PromptType;
  choices?: Array<{
    title: string;
    value: string | number;
    defaultOptions?: { [key: string]: unknown };
    disabledFields?: string[];
  }>;
}

type CliOptionsConfig = Array<{
  group: string;
  options: Array<IOption>;
}>;

const CliOptionsForm = ({
  form,
  version = "0.1.47",
}: {
  form: FormInstance;
  version?: string;
}) => {
  const disabledFieldsMapRef = useRef<Map<string, Set<string>>>(
    new Map<string, Set<string>>()
  );

  const skipFieldsMapRef = useRef<Map<string, Set<string>>>(
    new Map<string, Set<string>>()
  );

  const [update, setUpdate] = useState(0);

  const forceUpdate = () => {
    setUpdate((update) => ++update);
  };

  const [config, setConfig] = useState<CliOptionsConfig>();

  useEffect(() => {
    // 加载配置json
    fetch(`//unpkg.com/create-middle@${version}/dist/config.json`)
      .then((res) => res.json())
      .then((json) => {
        setConfig(json);
      });
  }, []);

  const onSelectChange = (name: string, option: Array<any> | any) => {
    // 哪些禁止输入
    if (option) {
      if (Array.isArray(option)) {
        const resetValues = {};
        let disabledFields = [];
        let skipFields = [];
        option.forEach((item) => {
          const {
            defaultOptions,
            disabledFields: _disabledFields = [],
            skipFields: _skipFields = [],
          } = item;
          if (defaultOptions) {
            Object.assign(resetValues, defaultOptions);
            disabledFields = [...disabledFields, ..._disabledFields];
            skipFields = [...skipFields, ..._skipFields];
          }
        });
        form.setFieldsValue(resetValues);
        disabledFieldsMapRef.current.set(name, new Set(disabledFields));
        skipFieldsMapRef.current.set(name, new Set(skipFields));
        forceUpdate();
      } else {
        const { defaultOptions, disabledFields = [], skipFields = [] } = option;
        if (defaultOptions) {
          form.setFieldsValue(defaultOptions);
          disabledFieldsMapRef.current.set(name, new Set(disabledFields));
          skipFieldsMapRef.current.set(name, new Set(skipFields));
          forceUpdate();
        }
      }
    } else {
      disabledFieldsMapRef.current.delete(name);
      skipFieldsMapRef.current.delete(name);
      forceUpdate();
    }
  };

  const disabledFields = useMemo(() => {
    let disabledSet = new Set<string>();
    disabledFieldsMapRef.current.forEach((subSet) => {
      if (subSet) {
        subSet.forEach((value) => disabledSet.add(value));
      }
    });
    return disabledSet;
  }, [update]);

  return (
    <>
      {config?.map((group) => {
        const { group: name, options } = group;
        return (
          <React.Fragment key={name}>
            <Divider>{name}</Divider>
            {options.map((option) => {
              const { name, label, type, initial, choices } = option;
              // 不同类型的使用不同的组件
              // "text" | "password" | "invisible" | "number" | "confirm" | "list" | "toggle" | "select" | "multiselect" | "autocomplete" | "date" | "autocompleteMultiselect"
              const disabled = disabledFields.has(name);
              switch (type) {
                case "text":
                  return (
                    <Form.Item
                      key={name}
                      label={label}
                      name={name}
                      initialValue={initial}
                    >
                      <Input disabled={disabled} />
                    </Form.Item>
                  );
                case "password":
                  return (
                    <Form.Item
                      key={name}
                      label={label}
                      name={name}
                      initialValue={initial}
                    >
                      <Input.Password disabled={disabled} />
                    </Form.Item>
                  );
                case "number":
                  return (
                    <Form.Item
                      key={name}
                      label={label}
                      name={name}
                      initialValue={initial}
                    >
                      <InputNumber disabled={disabled} />
                    </Form.Item>
                  );
                case "confirm":
                case "toggle":
                  return (
                    <Form.Item
                      key={name}
                      label={label}
                      name={name}
                      initialValue={initial}
                    >
                      <Switch disabled={disabled} />
                    </Form.Item>
                  );
                case "list":
                case "select":
                case "multiselect":
                  return (
                    <Form.Item
                      key={name}
                      label={label}
                      name={name}
                      initialValue={
                        initial == void 0
                          ? undefined
                          : choices?.[initial as number]?.value
                      }
                    >
                      <Select
                        mode={type === "multiselect" ? "tags" : undefined}
                        disabled={disabled}
                        onChange={(_, option) => onSelectChange(name, option)}
                        options={choices?.map((option) => ({
                          label: option.title,
                          value: option.value,
                          defaultOptions: option.defaultOptions,
                          disabledFields: option.disabledFields,
                        }))}
                      />
                    </Form.Item>
                  );
              }
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CliOptionsForm;
