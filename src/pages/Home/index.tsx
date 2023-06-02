import Guide from '@/components/Guide';
import { trim } from '@/utils/format';

import { DEFAULT_NAME } from '@/constants';

import styles from './index.less';

const HomePage: React.FC = () => {
  
  const name = DEFAULT_NAME;
  
  return (
    <div className={styles.container}>
      <Guide name={trim(name)} />
    </div>
  );
};

export default HomePage;
