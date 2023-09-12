/*
 * @Author: yanxlg
 * @Date: 2023-05-27 18:11:50
 * @LastEditors: yanxlg
 * @LastEditTime: 2023-05-29 11:43:33
 * @Description:
 *
 * Copyright (c) 2023 by yanxlg, All Rights Reserved.
 */
import {
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from "antd";
import {PromptObject, PromptType} from "prompts";
import React, {useEffect, useMemo, useRef, useState} from "react";
import configJson from 'create-middle/dist/config.json';


type ChoiceType = {
  title: string;
  value: string | number;
  defaultOptions?: { [key: string]: unknown };
  disabledFields?: string[];
  skipFields?: string[];
};

interface IOption extends Omit<PromptObject, "choices" | "name" | "type"> {
  label: string; // 表单label
  name: string;
  type: PromptType;
  required: true;
  skipFieldMap?: { true?: string[]; false?: string[] };
  disabledFieldMap?: { true?: string[]; false?: string[] };
  choices?: Array<ChoiceType>;
}

type CliOptionsConfig = Array<{
  group: string;
  options: Array<IOption>;
}>;

function parseOption(choice: ChoiceType) {
  return {
    ...choice,
    label: choice.title,
  };
}


const config = configJson as CliOptionsConfig;

const CliOptionsForm = (
  {
    form,
    cols = 3,
    disabled: globalDisabled,
    maxWidth,
    getPopupContainer,
    defaultValues
  }: {
    form: FormInstance;
    version?: string;
    cols?: number;
    disabled?: boolean;
    maxWidth?: number;
    getPopupContainer?: () => HTMLElement;
    defaultValues?: { [key: string]: unknown }; // 默认值填充
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


  useEffect(() => {
    // 处理默认值
    if (defaultValues) {
      config.forEach(group => {
        const options = group.options;
        options.forEach((option) => {
          const {type, initial, choices = [], name} = option;
          const value = defaultValues[name];
          if (type === "list" || type === "select") {
            const index = choices.findIndex(_ => _.value === value);
            option.initial = index === -1 ? undefined : index;
          } else if (type === "multiselect") {
            option.initial = value && Array.isArray(value) ? value.map(_ => {
              return choices.findIndex(__ => _ === __.value);
            }).filter(_ => _ !== -1) : undefined as unknown as any;
          } else {
            option.initial = value as unknown as any;
          }
        });
      });
    }


    config.forEach((group) => {
      const options = group.options;
      options.forEach((option) => {
        const {type, initial, choices = [], name} = option;
        if ((type === "list" || type === "select") && initial !== void 0) {
          onSelectChange(name, parseOption(choices[initial as unknown as number]), config);
        }
        if (type === "multiselect" && initial !== void 0) {
          if (Array.isArray(initial)) {
            onSelectChange(
              name,
              initial.map((_) => parseOption(choices[_])),
              config
            );
          } else {
            onSelectChange(name, parseOption(choices[initial as unknown as number]), config);
          }
        }
      });

      // 重新循环
      options.forEach((option) => {
        const {type, name} = option;
        if (type === "confirm" || type === "toggle") {
          onSwitchChange(name, form.getFieldValue(name) || false, option);
        }
      });
    });
  }, []);

  const onSelectChange = (
    name: string,
    option: Array<ChoiceType> | ChoiceType,
    config: CliOptionsConfig
  ) => {
    // 哪些禁止输入
    if (option) {
      if (Array.isArray(option)) {
        const resetValues = {};
        let disabledFields: string[] = [];
        let skipFields: string[] = [];
        option.forEach((item) => {
          const {
            defaultOptions,
            disabledFields: _disabledFields = [],
            skipFields: _skipFields = [],
          } = item;
          if (defaultOptions) {
            Object.assign(resetValues, defaultOptions);
          }
          disabledFields = [...disabledFields, ..._disabledFields];
          skipFields = [...skipFields, ..._skipFields];
        });
        form.setFieldsValue(resetValues);
        disabledFieldsMapRef.current.set(name, new Set(disabledFields));
        skipFieldsMapRef.current.set(name, new Set(skipFields));
        config.forEach((group) => {
          group.options.forEach((option) => {
            const {type, name} = option;
            if (type === "confirm" || type === "toggle") {
              onSwitchChange(name, form.getFieldValue(name) || false, option);
            }
          });
        });
        forceUpdate();
      } else {
        const {defaultOptions, disabledFields = [], skipFields = []} = option;
        if (defaultOptions) {
          form.setFieldsValue(defaultOptions); // switch 需要触发更新
          config.forEach((group) => {
            group.options.forEach((option) => {
              const {type, name} = option;
              if (type === "confirm" || type === "toggle") {
                onSwitchChange(name, form.getFieldValue(name) || false, option);
              }
            });
          });
        }
        disabledFieldsMapRef.current.set(name, new Set(disabledFields));
        skipFieldsMapRef.current.set(name, new Set(skipFields));
        forceUpdate();
      }
    } else {
      disabledFieldsMapRef.current.delete(name);
      skipFieldsMapRef.current.delete(name);
      forceUpdate();
    }
  };

  const onSwitchChange = (name: string, value: boolean, option: IOption) => {
    const {disabledFieldMap, skipFieldMap} = option;
    const disabledFields = disabledFieldMap
      ? disabledFieldMap[String(value) as unknown as 'true' | 'false']
      : [];
    const skipFields = skipFieldMap ? skipFieldMap[String(value) as unknown as 'true' | 'false'] : [];
    disabledFieldsMapRef.current.set(name, new Set(disabledFields));
    skipFieldsMapRef.current.set(name, new Set(skipFields));
    forceUpdate();
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

  const skipFields = useMemo(() => {
    let skipSet = new Set<string>();
    skipFieldsMapRef.current.forEach((subSet) => {
      if (subSet) {
        subSet.forEach((value) => skipSet.add(value));
      }
    });
    return skipSet;
  }, [update]);

  return (
    <>
      {config?.map((subConfig) => {
        const {group, options} = subConfig;
        const filterOptions = options.filter((_) => {
          return !skipFields.has(_.name);
        });
        if (!filterOptions.length) {
          return null;
        }
        const span = 24 / cols;
        return (
          <React.Fragment key={group}>
            <Divider orientation="left">{group}</Divider>
            <Row gutter={[24, 0]}>
              {filterOptions.map((option) => {
                const {required, name, label, type, initial, choices} =
                  option;
                const rules = required
                  ? [
                    {
                      required: true,
                      message: `请${
                        type === "select" ||
                        type === "list" ||
                        type === "multiselect"
                          ? "选择"
                          : "输入"
                      }${label}`,
                    },
                  ]
                  : undefined;
                // 不同类型的使用不同的组件
                // "text" | "password" | "invisible" | "number" | "confirm" | "list" | "toggle" | "select" | "multiselect" | "autocomplete" | "date" | "autocompleteMultiselect"
                const disabled = globalDisabled || disabledFields.has(name);
                switch (type) {
                  case "text":
                    return (
                      <Col span={span} key={name}>
                        <Form.Item
                          preserve={false}
                          label={label}
                          name={name}
                          initialValue={initial}
                          rules={rules}
                        >
                          <Input disabled={disabled} allowClear style={{width: maxWidth}}/>
                        </Form.Item>
                      </Col>
                    );
                  case "password":
                    return (
                      <Col span={span} key={name}>
                        <Form.Item
                          preserve={false}
                          label={label}
                          name={name}
                          initialValue={initial}
                          rules={rules}
                        >
                          <Input.Password disabled={disabled} allowClear style={{width: maxWidth}}/>
                        </Form.Item>
                      </Col>
                    );
                  case "number":
                    return (
                      <Col span={span} key={name}>
                        <Form.Item
                          preserve={false}
                          label={label}
                          name={name}
                          initialValue={initial}
                          rules={rules}
                        >
                          <InputNumber disabled={disabled} style={{width: maxWidth}}/>
                        </Form.Item>
                      </Col>
                    );
                  case "confirm":
                  case "toggle":
                    return (
                      <Col span={span} key={name}>
                        <Form.Item
                          preserve={false}
                          label={label}
                          name={name}
                          initialValue={initial}
                          valuePropName="checked"
                          rules={rules}
                        >
                          <Switch
                            disabled={disabled}
                            onChange={(checked) =>
                              onSwitchChange(name, checked, option)
                            }
                          />
                        </Form.Item>
                      </Col>
                    );
                  case "list":
                  case "select":
                  case "multiselect":
                    return (
                      <Col span={span} key={name}>
                        <Form.Item
                          preserve={false}
                          label={label}
                          name={name}
                          rules={rules}
                          initialValue={
                            initial == void 0
                              ? undefined
                              : choices?.[initial as number]?.value
                          }
                        >
                          <Select
                            mode={type === "multiselect" ? "tags" : undefined}
                            disabled={disabled}
                            onChange={(_, option) =>
                              onSelectChange(name, option, config)
                            }
                            optionLabelProp={"title"}
                            options={choices?.map((_) => parseOption(_))}
                            style={{width: maxWidth}}
                            getPopupContainer={getPopupContainer}
                          />
                        </Form.Item>
                      </Col>
                    );
                }
              })}
            </Row>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CliOptionsForm;
