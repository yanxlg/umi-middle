import Guide from '@/components/Guide';
import { trim } from '@/utils/format';

import { DEFAULT_NAME } from '@/constants';

import styles from './index.less';
import {useEffect} from "react";


// 测试 异常和监控

const HomePage: React.FC = () => {

  const name = DEFAULT_NAME;

  useEffect(()=>{
    // console.log("1111111----------");
    // const name = window['v'].name;
    // console.log(name);

    fetch("http://vasada.com/aaaa.js");
  },[]);

  return (
    <div className={styles.container}>
      <Guide name={trim(name)} />
      <img src={"/a/b.png"}/>
    </div>
  );
};

export default HomePage;
